<script lang="ts">
	import { Modal } from 'carbon-components-svelte';

	export let open: boolean;
	export let edits: { id: string; column: string }[];
</script>

<Modal
	bind:open
	modalHeading="Commit all changes"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:click:button--primary={() => (open = false)}
	on:submit
>
	<p>
		Are you certain you want to commit these {edits.length} changes across {new Set(
			edits.map((e) => e.id),
		).size} rows and {new Set(edits.map((e) => e.column)).size} columns?
	</p>
</Modal>
