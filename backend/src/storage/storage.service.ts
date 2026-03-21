import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || 'alpha-crm';
    this.s3 = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9001',
      region: 'us-east-1', // MinIO requires a region string
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'password123',
      },
      forcePathStyle: true, // Required for MinIO
    });
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`[Storage] Bucket '${this.bucket}' created`);
      } catch (err) {
        this.logger.error(
          `[Storage] Could not create bucket: ${(err as Error).message}`,
        );
      }
    }
  }

  /**
   * Upload a file buffer to MinIO/S3.
   * @param key - storage path e.g. 'recordings/call-123.mp3'
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
    this.logger.log(`[Storage] Uploaded: ${key}`);
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${key}`;
  }

  /**
   * Generate a pre-signed URL for secure temporary access.
   * @param expiresInSeconds - default 1 hour
   */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Delete a file from storage.
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`[Storage] Deleted: ${key}`);
  }

  /**
   * Generate a storage key for call recordings.
   */
  callRecordingKey(callId: string): string {
    return `recordings/${callId}.mp3`;
  }

  /**
   * Generate a storage key for attachments.
   */
  attachmentKey(leadId: string, filename: string): string {
    return `attachments/${leadId}/${Date.now()}-${filename}`;
  }

  /** Alias for attachmentKey — used by AttachmentsController */
  getAttachmentKey(leadId: string, filename: string): string {
    return this.attachmentKey(leadId, filename);
  }
}
