import ValidationError from '#domain/errors/ValidationError.js'
import { isNonNegativeInteger } from '#domain/shared/utils/isNonNegativeInteger.js'

class DurationMs {
	public readonly value: number

	public constructor(value: number) {
		if (!isNonNegativeInteger(value)) {
			throw new ValidationError('Duration must be a non-negative integer')
		}
		this.value = value
	}
}

export default DurationMs
