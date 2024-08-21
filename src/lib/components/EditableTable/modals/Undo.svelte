<script lang="ts">
	import { Modal } from 'carbon-components-svelte';

	export let open: boolean;
</script>

<Modal
	danger
	bind:open
	modalHeading="Undo all changes"
	primaryButtonText="Undo"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:click:button--primary={() => (open = false)}
	on:submit
>
	<p>This is a permanent action and cannot be undone.</p>
</Modal>
