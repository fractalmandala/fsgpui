import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./HackerNews.svelte', import.meta.url), {
	title: 'GPUIX + Svelte — Hacker News',
	width: 760,
	height: 820
});
