<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { Button } from 'carbon-components-svelte';
	import { TextBold, TextItalic } from 'carbon-icons-svelte';

	export let editor: Editor;
</script>

<div>
	<Button
		kind={editor.isActive('bold') ? 'secondary' : 'ghost'}
		on:click={() => editor.chain().focus().toggleBold().run()}
		iconDescription="Bold"
		icon={TextBold}
	/>
	<Button
		kind={editor.isActive('italic') ? 'secondary' : 'ghost'}
		on:click={() => editor.chain().focus().toggleItalic().run()}
		iconDescription="Italic"
		icon={TextItalic}
	/>
</div>

<style>
	div {
		background-color: white;
		display: flex;
		box-shadow: 0 0 10px #666;
	}
</style>
