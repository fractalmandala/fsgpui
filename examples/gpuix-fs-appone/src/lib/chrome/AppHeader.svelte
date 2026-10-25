<script lang="ts">
  import { fileURLToPath } from 'node:url';
  import { zoom_window } from 'gpuix-fractalsvelte';
  import { drag_window } from './window-drag.ts';

  let { title = 'App' } = $props();

  const logo = fileURLToPath(new URL('../assets/icon-light.png', import.meta.url));

  function on_header_mousedown(e: any) {
    if (e.button !== 0) return;

    // Second press of a double click: zoom, never start a drag.
    if (e.clickCount === 2) {
      e.stopPropagation();
      zoom_window();
      return;
    }

    drag_window();
  }

  function stop(e: any) {
    // Buttons and controls must not start a window drag.
    e.stopPropagation();
  }
</script>

<div class="app-header" onmousedown={on_header_mousedown}>
  <div class="traffic-light-space"></div>

  <div class="app-header-content row ycenter xbetween minw0">
		<div class="logo-area row gap-sm ycenter">
			<img src={logo} alt="logotype" objectFit="contain" class="logotype"/>
		</div>	
    <div class="row ycenter xright" onmousedown={stop}>
      <!-- app toolbar items go here -->
    </div>
  </div>
</div>
