import { vi } from 'vitest'

export const unitOfWorkMock = {
	execute: vi.fn().mockImplementation(async (callback: () => Promise<void>) => {
		return await callback()
	}),
}
