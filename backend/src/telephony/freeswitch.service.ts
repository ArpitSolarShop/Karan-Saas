import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as esl from 'modesl';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FreeswitchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FreeswitchService.name);
  private connection: any;
  private _isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private eventEmitter: EventEmitter2) {}

  /** Whether the ESL connection is alive */
  get isConnected(): boolean {
    return this._isConnected && !!this.connection;
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch {
        // ignore disconnect errors during shutdown
      }
      this.connection = null;
    }
    this._isConnected = false;
  }

  private connect() {
    const host = process.env.FREESWITCH_HOST || '127.0.0.1';
    const port = parseInt(process.env.FREESWITCH_ESL_PORT || '8021');
    const password = process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon';

    this.logger.log(`Connecting to FreeSWITCH ESL (${host}:${port})...`);
    
    try {
      this.connection = new esl.Connection(host, port, password, () => {
        this.logger.log('✅ Connected to FreeSWITCH ESL.');
        this._isConnected = true;
        this.reconnectAttempts = 0; // reset on successful connect

        this.connection.subscribe('ALL');
        this.connection.api('events json all', () => {
          this.logger.log('✅ Subscribed to FreeSWITCH JSON events.');
        });
      });

      this.connection.on('error', (err: any) => {
        this.logger.error(`FreeSWITCH ESL Error: ${err}`);
        this._isConnected = false;
        this.scheduleReconnect();
      });

      this.connection.on('end', () => {
        this.logger.warn('FreeSWITCH ESL connection closed.');
        this._isConnected = false;
        this.connection = null;
        this.scheduleReconnect();
      });

      this.connection.on('esl::event::CHANNEL_ANSWER::*', (event: any) => {
        const data = this.parseEvent(event);
        this.logger.log(`📞 Call answered: [${data.uuid}] -> ${data.destination}`);
        this.eventEmitter.emit('freeswitch.call.answered', data);
      });

      this.connection.on('esl::event::CHANNEL_HANGUP::*', (event: any) => {
        const data = this.parseEvent(event);
        this.logger.log(`📵 Call hung up: ${data.destination} (Cause: ${data.cause})`);
        this.eventEmitter.emit('freeswitch.call.hungup', data);
      });

      this.connection.on('esl::event::CHANNEL_BRIDGE::*', (event: any) => {
        const data = this.parseEvent(event);
        this.logger.log(`🔗 Call bridged: ${data.uuid}`);
        this.eventEmitter.emit('freeswitch.call.bridged', data);
      });

      this.connection.on('esl::event::RECORD_START::*', (event: any) => {
        const data = this.parseEvent(event);
        this.logger.log(`🔴 Recording started: ${data.uuid}`);
        this.eventEmitter.emit('freeswitch.recording.started', data);
      });

      this.connection.on('esl::event::RECORD_STOP::*', (event: any) => {
        const data = this.parseEvent(event);
        this.logger.log(`⏹ Recording stopped: ${data.uuid}`);
        this.eventEmitter.emit('freeswitch.recording.stopped', data);
      });
    } catch (e) {
      this.logger.error(`Could not connect to ESL: ${e}`);
      this._isConnected = false;
      this.scheduleReconnect();
    }
  }

  /** Reconnect with exponential backoff */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up on FreeSWITCH ESL.`,
      );
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // max 30s
    this.reconnectAttempts++;
    this.logger.warn(
      `Scheduling ESL reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private parseEvent(event: any) {
    return {
      uuid: event.getHeader('Unique-ID'),
      callerIdNumber: event.getHeader('Caller-Caller-ID-Number'),
      destination: event.getHeader('Caller-Destination-Number'),
      cause: event.getHeader('Hangup-Cause'),
      direction: event.getHeader('Call-Direction'),
      channel: event.getHeader('Channel-Name'),
    };
  }

  /** Ensure connection is alive before executing an ESL command */
  private ensureConnection(): void {
    if (!this.connection || !this._isConnected) {
      throw new Error('No active FreeSWITCH ESL connection');
    }
  }

  async originateCall(tenantId: string, extension: string, destination: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject('No FreeSWITCH connection');
      
      // In a real scenario, this would use a proper gateway configuration
      const cmd = `originate {origination_caller_id_number=${extension}}user/${extension} &bridge(sofia/gateway/provider/${destination})`;
      
      this.connection.bgapi(cmd, (res: any) => {
        const reply = res.getBody();
        if (reply.startsWith('-ERR')) {
          reject(reply);
        } else {
          const jobId = res.getHeader('Job-UUID');
          resolve(jobId);
        }
      });
    });
  }

  async bridgeCall(tenantId: string, uuid1: string, uuid2: string) {
    this.ensureConnection();
    this.connection.api(`uuid_bridge ${uuid1} ${uuid2}`);
  }

  async playAudio(tenantId: string, uuid: string, filePath: string) {
    this.ensureConnection();
    this.connection.api(`uuid_broadcast ${uuid} ${filePath} aleg`);
  }

  async hangup(tenantId: string, uuid: string) {
    this.ensureConnection();
    this.connection.api(`uuid_kill ${uuid}`);
  }

  async transfer(tenantId: string, uuid: string, extension: string) {
    this.ensureConnection();
    this.connection.api(`uuid_transfer ${uuid} ${extension}`);
  }

  /** Mute/unmute the read (microphone) leg of a call */
  async muteCall(uuid: string, mute: boolean) {
    this.ensureConnection();
    const action = mute ? 'start' : 'stop';
    this.connection.api(`uuid_audio ${uuid} ${action} read mute`);
  }

  /** Place a call on hold */
  async holdCall(uuid: string) {
    this.ensureConnection();
    this.connection.api(`uuid_hold ${uuid}`);
  }

  /** Resume a held call */
  async unholdCall(uuid: string) {
    this.ensureConnection();
    this.connection.api(`uuid_hold off ${uuid}`);
  }

  /** Start recording a call to a file */
  async startRecording(uuid: string, filePath: string) {
    this.ensureConnection();
    this.connection.api(`uuid_record ${uuid} start ${filePath}`);
  }

  /** Stop recording a call */
  async stopRecording(uuid: string, filePath: string) {
    this.ensureConnection();
    this.connection.api(`uuid_record ${uuid} stop ${filePath}`);
  }

  /** Eavesdrop in whisper mode — supervisor can speak to agent only */
  async eavesdropWhisper(uuid: string, supervisorExtension: string) {
    this.ensureConnection();
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    this.connection.bgapi(
      `originate user/${supervisorExtension}@${domain} &eavesdrop(${uuid})`,
    );
  }

  /** Barge-in — move call into conference and dial supervisor in */
  async bargeIn(uuid: string, supervisorExtension: string) {
    this.ensureConnection();
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    const confName = `barge_${uuid}`;
    // Move the existing call into a conference
    this.connection.api(`uuid_transfer ${uuid} conference:${confName} inline`);
    // Dial the supervisor into the same conference
    this.connection.bgapi(
      `originate user/${supervisorExtension}@${domain} &conference(${confName})`,
    );
  }

  /** Silent monitor — supervisor listens to the call without being heard by anyone */
  async silentMonitor(uuid: string, supervisorExtension: string) {
    this.ensureConnection();
    const domain = process.env.FREESWITCH_DOMAIN || '127.0.0.1';
    // set_var to enable whisper-only direction before eavesdrop → makes it listen-only
    this.connection.bgapi(
      `originate {eavesdrop_indicate_peer=true,eavesdrop_whisper_aleg=false,eavesdrop_whisper_bleg=false}user/${supervisorExtension}@${domain} &eavesdrop(${uuid})`,
    );
  }

  /** Send DTMF tones on a live call (RFC 2833) */
  async sendDtmf(uuid: string, digits: string, duration = 2000) {
    this.ensureConnection();
    this.connection.api(`uuid_send_dtmf ${uuid} ${digits}@${duration}`);
  }
}
