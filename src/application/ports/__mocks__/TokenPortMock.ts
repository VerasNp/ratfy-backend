import { vi } from 'vitest'
import type { TokenPort } from '../TokenPort'

export const tokenPortMock = {
	generateToken: vi.fn().mockResolvedValue('mocked-token'),
	verifyToken: vi.fn().mockResolvedValue({ userId: 'mocked-user-id' }),
}
