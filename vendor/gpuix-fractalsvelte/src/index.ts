export * from './web.ts';
export async function render_hot(entry: string | URL, options: any = {}) {
	const mod = await import('./hot.ts');
	return (mod.render_hot as any)(entry, options);
}
