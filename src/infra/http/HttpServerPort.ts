export interface HttpServerPort {
	/**
	 * Starts the HTTP server on the specified port.
	 */
	listen(): void
	/**
	 * Registers a route with the given HTTP method, URL, and callback function.
	 * @param method Method of the HTTP request (e.g., 'get', 'post', 'put', 'delete').
	 * @param url URL pattern for the route (e.g., '/users/:id').
	 * @param callback Function to handle the incoming request, which receives route parameters, request body, and query parameters as arguments.
	 */
	register(method: string, url: string, callback: Function): void
}
