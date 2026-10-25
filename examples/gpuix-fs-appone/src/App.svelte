<script lang="ts">

  import { set_css_vars } from 'gpuix-fractalsvelte';
  import AppHeader from './lib/chrome/AppHeader.svelte';
	let count = $state(0);
  let { dark } = $props();

const darkTheme = {
bg: '#121412',
bgSurface: '#1E201E',
bgPanel: '#2B2D2B',
bgExtra: '#262626',
bgButton: '#303530',
bgInput: '#191D19',
bgSunken: '#000301',
bgRaised: '#0F170F',
stateSurface: '#1C201C',
stateHover: '#192219',
stateActive: '#182518',
border: '#313131',
borderSubtle: '#212121',
borderStrong: '#474747',
textPrimary: '#FFFFFF',
textSecondary: '#929292',
textMuted: '#555555',
textInverse: '#121412',
textButton: '#FFFFFF',
themeColor: '#3D8F00',
themeColorAlt: '#508B26',
themeColorSub: '#316A00',
textSuccess: '#FFFFFF',
textInfo: '#FFFFFF',
textWarning: '#FFFFFF',
textDanger: '#FFFFFF',
bgSuccess: '#2f9e44',
bgInfo: '#1c7ed6',
bgWarning: '#fcc419',
bgDanger: '#e03131',
whiteFixed: '#FFFFFF',
blackFixed: '#111111',
}

const lightTheme = {
	bg: '#FFFFFF',
	bgSurface: '#FAFAFA',
	bgPanel: '#F5F5F5',
	bgExtra: '#EFF4EE',
	bgButton: '#293524',
	bgInput: '#F3F5F3',
	bgSunken: '#F6F6F6',
	bgRaised: '#DADCD9',
	stateSurface: '#E8EAE7',
	stateHover: '#DADCD9',
	stateActive: '#DBEFD0',
	border: '#EAEAEA',
	borderSubtle: '#F1F1F1',
	borderStrong: '#D7D7D7',
	textPrimary: '#121212',
	textSecondary: '#878787',
	textMuted: '#b7b7b7',
	textInverse: '#FFFFFF',
	textButton: '#FFFFFF',
	themeColor: '#3D8F00',
	themeColorAlt: '#508B26',
	themeColorSub: '#316A00',
	textSuccess: '#FFFFFF',
	textInfo: '#FFFFFF',
	textWarning: '#FFFFFF',
	textDanger: '#FFFFFF',
	bgSuccess: '#2f9e44',
	bgInfo: '#1c7ed6',
	bgWarning: '#fcc419',
	bgDanger: '#e03131',
	whiteFixed: '#FFFFFF',
	blackFixed: '#111111',
}

  $effect(() => set_css_vars(darkTheme ? darkTheme : lightTheme));
</script>

<div class="app-shell">
	<AppHeader title="ācinta" />
	<div class="app-main">
		<div class="main-section">
					<div class="card">
			<div class="count" testId="count">{count}</div>
		<div class="row">
			<div class="btn" testId="minus" onclick={() => count--}>-</div>
			<div class="btn primary" testId="plus" onclick={() => count++}>+</div>
		</div>
		<div class="row">
			<div class="btn" onclick={() => set_css_vars(lightTheme)}>
				light set
			</div>
			<div class="btn" onclick={() => set_css_vars(darkTheme)}>
				dark set
			</div>
		</div>
		<div class="hint">reacintg? acintaEdit App.sveltssxxxe and save — the window hot-reloads.</div>
	</div>
</div>
	</div>
	<div class="app-footer">
		<div>2026</div>
	</div>
</div>

<style>

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
		background-color: var(--themeColor);
	}
	.primary:hover {
		background-color: var(--stateHover);
	}
	.hint {
		color: var(--textSecondary);
		font-size: 13px;
	}
</style>
