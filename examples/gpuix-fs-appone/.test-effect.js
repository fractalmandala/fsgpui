import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>hello</div>`);

export default function _unknown_($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		console.log("USER EFFECT EXECUTED!");
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}