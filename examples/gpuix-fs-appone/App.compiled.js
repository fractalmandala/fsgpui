import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="app svelte-n50uah"><div class="card svelte-n50uah"><div class="count svelte-n50uah" testid="count"> </div> <div class="row svelte-n50uah"><div class="btn svelte-n50uah" testid="minus">-</div> <div class="btn primary svelte-n50uah" testid="plus">+</div></div> <div class="hint svelte-n50uah">Edit App.svelte and save — the window hot-reloads.</div></div></div>`);

export default function App($$anchor) {
	let count = $.state(0);
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.sibling(div_4, 2);

	$.reset(div_3);
	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', div_4, () => $.update(count, -1));
	$.delegated('click', div_5, () => $.update(count));
	$.append($$anchor, div);
}

$.delegate(['click']);