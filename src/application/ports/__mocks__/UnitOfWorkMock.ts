import { vi } from 'vitest'

export const unitOfWorkMock = {
	execute: vi.fn().mockImplementation(async (callback: (tx: any) => Promise<void>) => {
		return await callback({})
	}),
}
