import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type { CachePort, PlaybackState } from '#application/ports/CachePort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import CacheError from '#application/errors/CacheError.js'
import { z } from 'zod'

const EMPTY_PLAYBACK_STATE = { trackId: null, positionMs: 0, updatedAt: null } as const

const SetPlaybackSchema = z.object({
	trackId: z.string().uuid(),
	positionMs: z.number().int().min(0),
})

class PlaybackController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly cacheService: CachePort,
		private readonly authMiddleware: AuthMiddleware,
		private readonly loggerService: LoggerPort,
	) {
		this.httpServer.register(
			'put',
			'/playback/state',
			async (_params: any, body: any, _query: any, req: any) => {
				const { trackId, positionMs } = SetPlaybackSchema.parse(body)
				const state: PlaybackState = {
					trackId,
					positionMs,
					updatedAt: new Date().toISOString(),
				}
				await this.cacheService.setPlaybackState(req.user.userId, state)
				return {
					body: state,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/playback/state',
			async (_params: any, _body: any, _query: any, req: any) => {
				try {
					const state = await this.cacheService.getPlaybackState(req.user.userId)
					if (!state) return {
						body: EMPTY_PLAYBACK_STATE
					}
					return {
						body: state
					}
				} catch (error) {
					this.loggerService.warn('Failed to get playback state', {
						userId: req.user.userId,
						error,
					})
					return EMPTY_PLAYBACK_STATE
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/playback/state',
			async (_params: any, _body: any, _query: any, req: any) => {
				await this.cacheService.clearPlaybackState(req.user.userId)
				return undefined
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default PlaybackController
