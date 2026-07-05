import ValidationError from '#domain/errors/ValidationError.js'
import type AlbumType from './AlbumType'

class TotalTracks {
	public readonly value: number

	public constructor(value: number, albumType: AlbumType) {
		if (albumType.value === 'single' && value > 3) {
			throw new ValidationError('Single albums can have at most 3 tracks')
		} else if (albumType.value === 'ep' && (value < 4 || value > 6)) {
			throw new ValidationError('EP albums must have between 4 and 6 tracks')
		} else if (albumType.value === 'album' && value < 7) {
			throw new ValidationError('Album albums must have at least 7 tracks')
		}
		this.value = value
	}
}

export default TotalTracks
