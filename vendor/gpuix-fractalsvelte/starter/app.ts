import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./App.svelte', import.meta.url), {
	title: 'gpuix-fractalsvelte starter',
	width: 640,
	height: 480
});
