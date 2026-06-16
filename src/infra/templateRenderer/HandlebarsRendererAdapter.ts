import fs from 'node:fs/promises'
import type { TemplateRendererPort } from '../../application/ports/TemplateRendererPort'
import Handlebars from 'handlebars'
import path from 'node:path'

class HandlebarsRendererAdapter implements TemplateRendererPort {
	public constructor(private templatesDir: string) {}

	async render(templateName: string, data: Record<string, unknown>): Promise<string> {
		const filePath = path.join(this.templatesDir, `${templateName}.hbs`)
		const source = await fs.readFile(filePath, 'utf-8')
		const template = Handlebars.compile(source)
		return template(data)
	}
}

export default HandlebarsRendererAdapter
