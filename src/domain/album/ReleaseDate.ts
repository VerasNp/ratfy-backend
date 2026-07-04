import ValidationError from '#domain/errors/ValidationError.js'

export enum ReleasePrecisionEnum {
	YEAR = 'year',
	MONTH = 'month',
	DAY = 'day',
}

const RELEASE_PATTERNS: Record<ReleasePrecisionEnum, RegExp> = {
	[ReleasePrecisionEnum.DAY]: /^\d{4}-\d{2}-\d{2}$/,
	[ReleasePrecisionEnum.MONTH]: /^\d{4}-\d{2}$/,
	[ReleasePrecisionEnum.YEAR]: /^\d{4}$/,
}

class ReleaseDate {
	public readonly value: string
	public readonly precision: ReleasePrecisionEnum

	public constructor(value: string, precision: string) {
		if (!this._isReleasePrecision(precision)) {
			throw new ValidationError('Invalid release precision')
		}
		if (!RELEASE_PATTERNS[precision].test(value)) {
			throw new ValidationError(
				`releaseDate "${value}" does not match precision "${precision}". ` +
					`Expected format: ${String(RELEASE_PATTERNS[precision])}`,
			)
		}
		this.value = value
		this.precision = precision
	}

	private _isReleasePrecision(value: string): value is ReleasePrecisionEnum {
		return Object.values(ReleasePrecisionEnum).includes(value as ReleasePrecisionEnum)
	}
}
export default ReleaseDate
