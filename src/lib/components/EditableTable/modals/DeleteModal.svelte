<script lang="ts">
	import { Modal } from 'carbon-components-svelte';

	export let open: boolean;
	export let gridSelectionRowCount: number;
</script>

<Modal
	danger
	bind:open
	modalHeading="Delete all selected"
	primaryButtonText="Delete"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:click:button--primary={() => (open = false)}
	on:submit
>
	<p>
		Are you certain you want to delete these {gridSelectionRowCount} rows? This is a permanent action
		and cannot be undone.
	</p>
</Modal>
