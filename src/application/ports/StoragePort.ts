export interface StoragePort {
  bucketExists(bucket: string): Promise<boolean>
  delete(bucket: string, key: string): Promise<void>
  download(bucket: string, key: string): Promise<Buffer>
  ensureBucket(bucket: string): Promise<void>
  getPresignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>
  getPublicUrl(bucket: string, key: string): string
  upload(bucket: string, key: string, file: Buffer, contentType: string): Promise<string>
}
