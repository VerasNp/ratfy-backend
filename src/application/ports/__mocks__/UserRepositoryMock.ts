import { vi } from 'vitest'
import type { UserRepository } from '../UserRepository'

export const userRepositoryMock: UserRepository = {
	create: vi.fn(),
	findByEmail: vi.fn(),
	update: vi.fn(),
	findById: vi.fn(),
}
