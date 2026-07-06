import type Artist from '#domain/artist/Artist.js'

class ArtistCredit {
	public readonly artistId: string
	private readonly _artist: Artist | undefined

	private constructor(artistId: string, artist?: Artist) {
		this.artistId = artistId
		this._artist = artist
	}

	public static create(artistId: string, artist?: Artist): ArtistCredit {
		return new ArtistCredit(artistId, artist)
	}

	public get artist(): Artist | undefined {
		return this._artist
	}
}

export default ArtistCredit
