import type { HashPort } from '#application/ports/HashPort.js'
import argon2 from 'argon2'

class Argon2Adapter implements HashPort {
	public async hash(value: string): Promise<string> {
		return argon2.hash(value)
	}

	public async compare(value: string, hash: string): Promise<boolean> {
		return argon2.verify(hash, value)
	}
}

export default Argon2Adapter
