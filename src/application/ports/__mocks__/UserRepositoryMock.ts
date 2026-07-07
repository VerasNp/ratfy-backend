import { vi } from 'vitest'
import type { UserRepository } from '../UserRepository'

export const userRepositoryMock: UserRepository = {
	create: vi.fn(),
	findByEmail: vi.fn(),
	updateUser: vi.fn(),
	findById: vi.fn(),
}
