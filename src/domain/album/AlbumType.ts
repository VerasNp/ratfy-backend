import ValidationError from '#domain/errors/ValidationError.js'

enum AlbumTypeEnum {
	ALBUM = 'album',
	SINGLE = 'single',
	EP = 'ep',
}

class AlbumType {
	public readonly value: string

	public constructor(value: string) {
		if (value !== AlbumTypeEnum.ALBUM && value !== AlbumTypeEnum.SINGLE && value !== AlbumTypeEnum.EP) {
			throw new ValidationError(`Invalid AlbumType value: ${value}`)
		}
		this.value = value
	}
}

export default AlbumType
