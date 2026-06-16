import { vi } from 'vitest'
import type { LoggerPort } from '../LoggerPort'

export const loggerPortMock: LoggerPort = {
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
}
