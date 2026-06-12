export interface HttpServer {
	listen(port: number): void
	register(method: string, url: string, callback: Function): void
}
