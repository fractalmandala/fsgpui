// The entry `npm run build` compiles: a binary carries no source to hot-reload, so it imports the
// component statically and mounts it with `render`.
import { render } from 'gpuix-fractalsvelte';
import App from './src/App.svelte';

render(App, {
	title: 'gpuix-fractalsvelte starter',
	width: 640,
	height: 480
});
