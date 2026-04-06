import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucket = this.config.get('MINIO_BUCKET', 'vertix-uploads');
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'minio'),
      port: parseInt(this.config.get('MINIO_PORT', '9000')),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'vertix_minio'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'vertix_minio_secret'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        console.log(`Bucket '${this.bucket}' created`);
      }
    } catch (error) {
      console.warn('MinIO bucket init failed (service may not be running):', error.message);
    }
  }

  async upload(
    tenantId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; fileName: string; filePath: string; contentType: string; size: number }> {
    const ext = file.originalname.split('.').pop();
    const key = `${tenantId}/${uuid()}.${ext}`;

    await this.client.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const attachment = await this.prisma.attachment.create({
      data: {
        tenantId,
        fileName: file.originalname,
        filePath: key,
        contentType: file.mimetype,
        size: file.size,
      },
    });

    return attachment;
  }

  async getPresignedUrl(filePath: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, filePath, expirySeconds);
  }

  async delete(filePath: string): Promise<void> {
    await this.client.removeObject(this.bucket, filePath);
  }
}
