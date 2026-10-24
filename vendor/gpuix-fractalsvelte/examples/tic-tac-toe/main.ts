import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./TicTacToe.svelte', import.meta.url), {
	title: 'GPUIX + Svelte — Tic-tac-toe',
	width: 480,
	height: 640
});
