import { vi } from 'vitest'

export const favoriteRepositoryMock = {
	removeAllByEntity: vi.fn().mockResolvedValue(undefined),
	add: vi.fn().mockResolvedValue(undefined),
	remove: vi.fn().mockResolvedValue(undefined),
	findEntityIdsByUserAndType: vi.fn().mockResolvedValue([]),
	isFavorited: vi.fn().mockResolvedValue(false),
}
