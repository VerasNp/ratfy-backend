import TokenRevokedError from '#domain/errors/TokenRevokedError.js'

export class RefreshToken {
	private constructor(
		public readonly id: string,
		public readonly token: string,
		public readonly userId: string,
		public readonly expiresAt: Date,
		public readonly createdAt: Date,
		private revokedAt: Date | null = null,
	) {}

	public static create(token: string, userId: string, expiresAt: Date) {
		const id = crypto.randomUUID()
		return new RefreshToken(id, token, userId, expiresAt, new Date())
	}

	public static restore(
		id: string,
		token: string,
		userId: string,
		expiresAt: Date,
		createdAt: Date,
		revokedAt: Date | null = null,
	) {
		return new RefreshToken(id, token, userId, expiresAt, createdAt, revokedAt)
	}

	public revoke() {
		if (this.revokedAt) {
			throw new TokenRevokedError()
		}
		this.revokedAt = new Date()
	}

	public isRevoked(): boolean {
		return this.revokedAt !== null
	}

	public isExpired(): boolean {
		return this.expiresAt.getTime() <= Date.now()
	}

	public isValid(): boolean {
		return !this.isExpired() && !this.isRevoked()
	}
}
