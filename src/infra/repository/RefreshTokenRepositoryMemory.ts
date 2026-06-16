import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'
import type { RefreshToken } from '#domain/refreshToken/RefreshToken.js'

class RefreshTokenRepositoryMemory implements RefreshTokenRepository {
	private refreshTokens: RefreshToken[] = []

	public create(refreshToken: RefreshToken): Promise<void> {
		this.refreshTokens.push(refreshToken)
		return Promise.resolve()
	}
	public revoke(tokenId: string): Promise<void> {
		const index = this.refreshTokens.findIndex((t) => t.id === tokenId)
		if (index !== -1) {
			this.refreshTokens[index]!.revoke()
		}
		return Promise.resolve()
	}
	public findByUserId(userId: string): Promise<RefreshToken | null> {
		const refreshToken = this.refreshTokens.find((t) => t.userId === userId)
		return Promise.resolve(refreshToken || null)
	}
	public findByTokenId(token: string): Promise<RefreshToken | null> {
		const refreshToken = this.refreshTokens.find((t) => t.token === token)
		return Promise.resolve(refreshToken || null)
	}
	public deleteExpiredTokens(): Promise<void> {
		this.refreshTokens = this.refreshTokens.filter((t) => !t.isExpired())
		return Promise.resolve()
	}
	public revokeAllByUserId(userId: string): Promise<void> {
		this.refreshTokens.forEach((t) => {
			if (t.userId === userId) {
				t.revoke()
			}
		})
		return Promise.resolve()
	}
}

export default RefreshTokenRepositoryMemory
