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

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    if (this.connection) {
      this.connection.disconnect();
    }
  }

  private connect() {
    const host = process.env.FREESWITCH_HOST || '127.0.0.1';
    const port = parseInt(process.env.FREESWITCH_ESL_PORT || '8021');
    const password = process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon';

    this.logger.log(`Connecting to FreeSWITCH ESL (${host}:${port})...`);
    
    try {
      this.connection = new esl.Connection(host, port, password, () => {
        this.logger.log('✅ Connected to FreeSWITCH ESL.');
        this.connection.subscribe('ALL');
        this.connection.api('events json all', () => {
          this.logger.log('✅ Subscribed to FreeSWITCH JSON events.');
        });
      });

      this.connection.on('error', (err: any) => {
        this.logger.error(`FreeSWITCH ESL Error: ${err}`);
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
    } catch (e) {
      this.logger.error(`Could not connect to ESL: ${e}`);
    }
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

  async originateCall(extension: string, destination: string): Promise<string> {
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

  async bridgeCall(uuid1: string, uuid2: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_bridge ${uuid1} ${uuid2}`);
  }

  async playAudio(uuid: string, filePath: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_broadcast ${uuid} ${filePath} aleg`);
  }

  async hangup(uuid: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_kill ${uuid}`);
  }

  async transfer(uuid: string, extension: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_transfer ${uuid} ${extension}`);
  }
}
