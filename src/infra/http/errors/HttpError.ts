class HttpError {
	public constructor(
		public statusCode: number,
		public message: string,
	) {}
}

export default HttpError
