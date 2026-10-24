<script lang="ts">

  import { set_css_vars } from 'gpuix-fractalsvelte';
	let count = $state(0);

  const LIGHT = { surface: '#fFFFFF', ink: '#2a251f', border: '#e2d8c4', bgButton: '#474747', textButton: '#FFFFFF', stateHover: '#313131', bgAccent: '#04AA32' };
  const DARK = { surface: '#181218', ink: '#FFFFFF', border: '#36302a', bgButton: '#474747', textButton: '#FFFFFF', stateHover: '#313131', bgAccent: '#04AA32' };
  let { dark } = $props();

  $effect(() => set_css_vars(dark ? DARK : LIGHT));
</script>

<div class="app">
	<div class="card">
		<div class="count" testId="count">{count}</div>
		<div class="row">
			<div class="btn" testId="minus" onclick={() => count--}>-</div>
			<div class="btn primary" testId="plus" onclick={() => count++}>+</div>
		</div>
		<div class="row">
			<div class="btn" onclick={() => set_css_vars(LIGHT)}>
				light set
			</div>
			<div class="btn" onclick={() => set_css_vars(DARK)}>
				dark set
			</div>
		</div>
		<div class="hint">Edit App.sveltssxxxe and save — the window hot-reloads.</div>
	</div>
</div>

<style>

	.app {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
		justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--surface);
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px;
	}
	.count {
		font-size: 48px;
		font-weight: bold;
		color: var(--ink);
	}
	.row {
		display: flex;
		flex-direction: row;
		gap: 12px;
	}
	.btn {
		padding: 6px 16px;
		background-color: var(--bgButton);
		color: var(--textButton);
		font-weight: 400;
		font-size: 15px;
		cursor: pointer;
		border-radius: 0;
	}
	.btn:hover {
		background-color: var(--stateHover);
	}
	.primary {
		background-color: var(--bgAccent);
	}
	.primary:hover {
		background-color: var(--stateHover);
	}
	.hint {
		color: var(--ink);
		font-size: 13px;
	}
</style>
