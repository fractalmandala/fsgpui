import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="app svelte-4f7g3a"><div class="card svelte-4f7g3a"><div class="count svelte-4f7g3a" testid="count"> </div> <div class="row svelte-4f7g3a"><div class="btn svelte-4f7g3a" testid="minus">-</div> <div class="btn primary svelte-4f7g3a" testid="plus">+</div></div> <div class="hint svelte-4f7g3a">Edit App.svelte and save — the window hot-reloads.</div></div></div>`);

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