import { vi } from 'vitest'
import type { StoragePort } from '../StoragePort'

export const storagePortMock: StoragePort = {
  bucketExists: vi.fn(),
  delete: vi.fn(),
  download: vi.fn(),
  ensureBucket: vi.fn(),
  getPresignedUrl: vi.fn(),
  getPublicUrl: vi.fn(),
  upload: vi.fn(),
}
