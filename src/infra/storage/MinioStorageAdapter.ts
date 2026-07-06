import { Client as MinioClient } from 'minio'

import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import StorageError from '#application/errors/StorageError.js'

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

class MinioStorageAdapter implements StoragePort {
  private client: MinioClient

  public constructor(
    private readonly minioConfig: {
      accessKey: string
      endpoint: string
      port: number
      secretKey: string
      useSSL: boolean
      publicUrl?: string
      region?: string
    },
    private readonly loggerService: LoggerPort,
  ) {
    if (this.minioConfig.publicUrl) {
      this.minioConfig.publicUrl = this.minioConfig.publicUrl.replace(/\/+$/, '')
    }
    this.client = new MinioClient({
      accessKey: this.minioConfig.accessKey,
      endPoint: this.minioConfig.endpoint,
      port: this.minioConfig.port,
      secretKey: this.minioConfig.secretKey,
      useSSL: this.minioConfig.useSSL,
      region: this.minioConfig.region ?? 'us-east-1',
    })
  }

  public async bucketExists(bucket: string): Promise<boolean> {
    try {
      return await this.client.bucketExists(bucket)
    } catch (error) {
      throw new StorageError(`Failed to check bucket existence: ${extractErrorMessage(error)}`, error)
    }
  }

  public async delete(bucket: string, key: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, key)
    } catch (error) {
      throw new StorageError(`Failed to delete object: ${extractErrorMessage(error)}`, error)
    }
  }

  public async download(bucket: string, key: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucket, key)
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      return Buffer.concat(chunks)
    } catch (error) {
      throw new StorageError(`Failed to download object: ${extractErrorMessage(error)}`, error)
    }
  }

  public async ensureBucket(bucket: string, isPublic = false): Promise<void> {
    try {
      const exists = await this.bucketExists(bucket)
      if (!exists) {
        await this.client.makeBucket(bucket)
        this.loggerService.info('Created MinIO bucket', { bucket })
      }
      if (isPublic) {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }
        await this.client.setBucketPolicy(bucket, JSON.stringify(policy))
        this.loggerService.info('Set public read policy for MinIO bucket', { bucket })
      }
    } catch (error) {
      throw new StorageError(`Failed to ensure bucket: ${extractErrorMessage(error)}`, error)
    }
  }

  public async getPresignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    try {
      const safeExpiry = Math.min(expiresIn, 604_800)
      if (safeExpiry !== expiresIn) {
        this.loggerService.warn('Presigned URL expiry capped to 7 days', { requested: expiresIn, capped: safeExpiry })
      }
      return await this.client.presignedGetObject(bucket, key, safeExpiry)
    } catch (error) {
      throw new StorageError(`Failed to generate presigned URL: ${extractErrorMessage(error)}`, error)
    }
  }

  public getPublicUrl(bucket: string, key: string): string {
    if (this.minioConfig.publicUrl) {
      return `${this.minioConfig.publicUrl}/${bucket}/${key}`
    }
    const protocol = this.minioConfig.useSSL ? 'https' : 'http'
    return `${protocol}://${this.minioConfig.endpoint}:${String(this.minioConfig.port)}/${bucket}/${key}`
  }

  public async upload(bucket: string, key: string, file: Buffer, contentType: string): Promise<string> {
    try {
      await this.client.putObject(bucket, key, file, file.length, { 'Content-Type': contentType })
      return this.getPublicUrl(bucket, key)
    } catch (error) {
      throw new StorageError(`Failed to upload object: ${extractErrorMessage(error)}`, error)
    }
  }
}

export default MinioStorageAdapter
