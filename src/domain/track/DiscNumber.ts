import ValidationError from '#domain/errors/ValidationError.js'
import { isNonNegativeInteger } from '#domain/shared/utils/isNonNegativeInteger.js'

class DiscNumber {
	public readonly value: number

	public constructor(value: number) {
		if (!isNonNegativeInteger(value)) {
			throw new ValidationError('Disc number must be a non-negative integer')
		}
		if (value < 1) {
			throw new ValidationError('Disc number must be at least 1')
		}
		this.value = value
	}
}

export default DiscNumber
