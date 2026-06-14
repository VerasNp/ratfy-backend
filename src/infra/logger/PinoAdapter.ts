import type { LoggerPort } from '#application/ports/LoggerPort.js'
import pino, { type Logger } from 'pino'

class PinoAdapter implements LoggerPort {
	private logger: Logger

	public constructor() {
		this.logger = pino(
			pino.transport({
				targets: [
					{
						target: 'pino-pretty',
						options: { colorize: true },
						level: 'debug',
					},
				],
			}),
		)
	}

	public info(message: string, meta: Record<string, unknown>): void {
		this.logger.info({ ...meta, message })
	}
	public warn(message: string, meta?: Record<string, unknown>): void {
		this.logger.warn({ ...meta, message })
	}
	public error(message: string, meta?: Record<string, unknown>): void {
		this.logger.error({ ...meta, message })
	}
	public debug(message: string, meta?: Record<string, unknown>): void {
		this.logger.debug({ ...meta, message })
	}
}

export default PinoAdapter
