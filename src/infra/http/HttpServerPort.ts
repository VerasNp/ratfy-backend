export interface HttpServerPort {
	/**
	 * Starts the HTTP server on the specified port.
	 */
	listen(): void
	/**
	 * Registers a route with the given HTTP method, URL, and callback function.
	 * @param method Method of the HTTP request (e.g., 'get', 'post', 'put', 'delete').
	 * @param url URL pattern for the route
	 * @param callback Function to handle the incoming request, which receives route parameters, request body, and query parameters as arguments.
	 * @param middlewares Array of middleware functions to be executed before the callback.
	 */
	register(method: string, url: string, callback: Function, middlewares?: Function[]): void
	/**
	 * Registers a global error handler for the HTTP server to catch and handle errors that occur during request processing.
	 */
	registerErrorHandler(): void
}

export interface CookieOptions {
	httpOnly: boolean
	secure: boolean
	sameSite: 'strict' | 'lax' | 'none'
	maxAge: number
	path?: string
}

export interface HttpResponse {
	body?: unknown
	cookies?: { name: string; value: string; options: CookieOptions }[]
	status?: number
}
