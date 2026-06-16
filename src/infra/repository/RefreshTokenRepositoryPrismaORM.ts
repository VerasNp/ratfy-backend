import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'
import { RefreshToken } from '#domain/refreshToken/RefreshToken.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class RefreshTokenRepositoryPrismaORM implements RefreshTokenRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async revokeAllByUserId(userId: string): Promise<void> {
		await this.orm.refreshToken.updateMany({
			where: {
				userId,
				revokedAt: null,
			},
			data: {
				revokedAt: new Date(),
			},
		})
	}

	public async findByTokenId(token: string): Promise<RefreshToken | null> {
		const result = await this.orm.refreshToken.findUnique({
			where: {
				token,
			},
		})
		if (!result) {
			return null
		}
		return RefreshToken.restore(
			result.id,
			result.token,
			result.userId,
			result.expiresAt,
			result.createdAt,
			result.revokedAt,
		)
	}

	public async findByUserId(userId: string): Promise<RefreshToken | null> {
		const result = await this.orm.refreshToken.findFirst({
			where: {
				userId,
				revokedAt: null,
			},
		})
		if (!result) {
			return null
		}
		return RefreshToken.restore(
			result.id,
			result.token,
			result.userId,
			result.expiresAt,
			result.createdAt,
			result.revokedAt,
		)
	}

	public async deleteExpiredTokens(): Promise<void> {
		await this.orm.refreshToken.deleteMany({
			where: {
				expiresAt: {
					lte: new Date(),
				},
			},
		})
	}

	public async create(refreshToken: RefreshToken): Promise<void> {
		await this.orm.refreshToken.create({
			data: {
				id: refreshToken.id,
				token: refreshToken.token,
				userId: refreshToken.userId,
				expiresAt: refreshToken.expiresAt,
				revokedAt: refreshToken.isRevoked() ? new Date() : null,
			},
		})
	}

	public async revoke(id: string): Promise<void> {
		await this.orm.refreshToken.update({
			where: {
				id,
			},
			data: {
				revokedAt: new Date(),
			},
		})
	}
}

export default RefreshTokenRepositoryPrismaORM
