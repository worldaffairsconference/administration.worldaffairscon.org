<script lang="ts">
	import { Tag } from 'carbon-components-svelte';
	import { CheckmarkOutline, Warning } from 'carbon-icons-svelte';

	export let valid: boolean;
</script>

{#if valid}
	<Tag icon={CheckmarkOutline} type="green">Valid</Tag>
{:else}
	<Tag icon={Warning} type="red">Invalid</Tag>
{/if}
