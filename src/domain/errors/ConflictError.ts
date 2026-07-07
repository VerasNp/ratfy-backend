import DomainError from "./DomainError";

class ConflictError extends DomainError {
	constructor(message: string) {
		super(message || "Conflict error");
	}
}

export default ConflictError;
