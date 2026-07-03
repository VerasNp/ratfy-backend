import ValidationError from '#domain/errors/ValidationError.js'
import type User from '#domain/user/User.js'
import crypto from 'crypto'

class Artist {
	public readonly id: string
	private _bio: string | null
	private _userId: string
	private _user: User | null

	private constructor(params: {
		id: string
		bio: string | null
		userId: string
		user: User | null
	}) {
		this.id = params.id
		this._bio = params.bio
		this._userId = params.userId
		this._user = params.user
	}

	public static create(params: {
		bio: string | null
		user: User
		createdAt?: Date
		updatedAt?: Date
	}): Artist {
		return new Artist({
			id: crypto.randomUUID(),
			bio: params.bio,
			userId: params.user.id,
			user: params.user,
		})
	}

	public static restore(params: {
		id: string
		bio: string | null
		userId: string
		user?: User | null
	}): Artist {
		return new Artist({
			...params,
			bio: params.bio,
			user: params.user ?? null,
		})
	}

	public updateData(data: { bio?: string | null }): void {
		if (data.bio !== undefined) {
			this._bio = data.bio
		}
	}

	public get bio() {
		return this._bio
	}
	public get userId() {
		return this._userId
	}
	public get user() {
		return this._user
	}
}

export default Artist
