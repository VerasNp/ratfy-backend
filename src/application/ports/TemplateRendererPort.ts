export interface TemplateRendererPort {
	/**
	 * Renders a template with the given name and data, returning the resulting string.
	 * @param templateName Name of the template to render (without file extension).
	 * @param data Data to pass to the template.
	 */
	render(templateName: string, data: Record<string, any>): Promise<string>
}
