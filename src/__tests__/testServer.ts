import { docsServiceMock } from '#application/ports/__mocks__/DocsServiceMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'

export function createTestServer() {
	const server = new ExpressAdapter(0, loggerPortMock, docsServiceMock)
	return server
}
