import StorageError from '#application/errors/StorageError.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import MinioStorageAdapter from '#infra/storage/MinioStorageAdapter.js'
import { beforeEach, describe, expect, inject, it } from 'vitest'

const TEST_BUCKET = 'test-bucket'

let adapter: MinioStorageAdapter

describe('MinioStorageAdapter', () => {
  beforeEach(async () => {
    adapter = new MinioStorageAdapter(
      {
        accessKey: inject('testMinioAccessKey'),
        endpoint: inject('testMinioEndpoint'),
        port: inject('testMinioPort'),
        secretKey: inject('testMinioSecretKey'),
        useSSL: false,
      },
      loggerPortMock,
    )
    await adapter.ensureBucket(TEST_BUCKET)
  })

  it('should upload and download an object', async () => {
    const data = Buffer.from('hello minio')
    const key = 'test-upload.txt'

    const url = await adapter.upload(TEST_BUCKET, key, data, 'text/plain')
    expect(url).toContain(key)

    const downloaded = await adapter.download(TEST_BUCKET, key)
    expect(downloaded.toString()).toBe('hello minio')
  })

  it('should check if a bucket exists', async () => {
    const exists = await adapter.bucketExists(TEST_BUCKET)
    expect(exists).toBe(true)

    const noExists = await adapter.bucketExists('non-existent-bucket')
    expect(noExists).toBe(false)
  })

  it('should delete an object', async () => {
    const key = 'test-delete.txt'
    await adapter.upload(TEST_BUCKET, key, Buffer.from('data'), 'text/plain')

    await adapter.delete(TEST_BUCKET, key)

    await expect(adapter.download(TEST_BUCKET, key)).rejects.toThrow(/does not exist/i)
  })

  it('should get a public URL', () => {
    const url = adapter.getPublicUrl(TEST_BUCKET, 'some/key.txt')
    expect(url).toBe(`http://${inject('testMinioEndpoint')}:${String(inject('testMinioPort'))}/${TEST_BUCKET}/some/key.txt`)
  })

  it('should get a presigned URL', async () => {
    const key = 'test-presigned.txt'
    await adapter.upload(TEST_BUCKET, key, Buffer.from('data'), 'text/plain')

    const url = await adapter.getPresignedUrl(TEST_BUCKET, key)
    expect(url).toContain(key)
    expect(url).toContain('X-Amz-Signature')
  })

  it('should get a public URL with custom publicUrl', () => {
    const adapterWithPublicUrl = new MinioStorageAdapter(
      {
        accessKey: inject('testMinioAccessKey'),
        endpoint: inject('testMinioEndpoint'),
        port: inject('testMinioPort'),
        secretKey: inject('testMinioSecretKey'),
        useSSL: false,
        publicUrl: 'https://cdn.example.com',
      },
      loggerPortMock,
    )

    const url = adapterWithPublicUrl.getPublicUrl(TEST_BUCKET, 'some/key.txt')
    expect(url).toBe('https://cdn.example.com/test-bucket/some/key.txt')
  })

  it('should strip trailing slash from publicUrl', () => {
    const adapterWithSlash = new MinioStorageAdapter(
      {
        accessKey: inject('testMinioAccessKey'),
        endpoint: inject('testMinioEndpoint'),
        port: inject('testMinioPort'),
        secretKey: inject('testMinioSecretKey'),
        useSSL: false,
        publicUrl: 'https://cdn.example.com/',
      },
      loggerPortMock,
    )

    const url = adapterWithSlash.getPublicUrl(TEST_BUCKET, 'some/key.txt')
    expect(url).toBe('https://cdn.example.com/test-bucket/some/key.txt')
  })

  it('should throw StorageError when downloading nonexistent key', async () => {
    await expect(adapter.download(TEST_BUCKET, 'nonexistent-key')).rejects.toThrow(StorageError)
  })
})
