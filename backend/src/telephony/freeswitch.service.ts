import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as esl from 'modesl';

@Injectable()
export class FreeswitchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FreeswitchService.name);
  private connection: any;

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    if (this.connection) {
      this.connection.disconnect();
    }
  }

  private connect() {
    this.logger.log('Connecting to FreeSWITCH ESL (127.0.0.1:8021)...');
    try {
      this.connection = new esl.Connection('127.0.0.1', 8021, 'ClueCon', () => {
        this.logger.log('✅ Connected to FreeSWITCH ESL.');
        this.connection.api('events json all', () => {
          this.logger.log('✅ Subscribed to FreeSWITCH JSON events.');
        });
      });

      this.connection.on('error', (err: any) => {
        this.logger.error(`FreeSWITCH ESL Error: ${err}`);
      });

      this.connection.on('esl::event::CHANNEL_ANSWER::*', (event: any) => {
        const dest = event.getHeader('Caller-Destination-Number');
        const uuid = event.getHeader('Unique-ID');
        this.logger.log(`📞 Call answered: [${uuid}] -> ${dest}`);
      });

      this.connection.on('esl::event::CHANNEL_HANGUP::*', (event: any) => {
        const dest = event.getHeader('Caller-Destination-Number');
        const cause = event.getHeader('Hangup-Cause');
        this.logger.log(`📵 Call hung up: ${dest} (Cause: ${cause})`);
      });
    } catch (e) {
      this.logger.error(`Could not connect to ESL: ${e}`);
    }
  }

  async originateCall(extension: string, destination: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.connection) return reject('No FreeSWITCH connection');
      const cmd = `originate user/${extension} &bridge(sofia/gateway/provider/${destination})`;
      this.connection.bgapi(cmd, (res: any) => {
        const jobId = res.getHeader('Job-UUID');
        resolve(jobId);
      });
    });
  }

  async dropVoicemail(uuid: string, audioFile: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_broadcast ${uuid} ${audioFile} aleg`);
  }

  async hangup(uuid: string) {
    if (!this.connection) return;
    this.connection.api(`uuid_kill ${uuid}`);
  }
}
