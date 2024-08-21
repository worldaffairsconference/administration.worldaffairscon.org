<script lang="ts">
	import { Button } from 'carbon-components-svelte';
	import {
		Add,
		DocumentExport,
		DocumentImport,
		Edit,
		Renew,
		Save,
		Stop,
		TrashCan,
		User,
	} from 'carbon-icons-svelte';
	import { createEventDispatcher } from 'svelte';

	import DeleteModal from './modals/DeleteModal.svelte';
	import ImportModal from './modals/ImportModal.svelte';
	import UndoModal from './modals/Undo.svelte';
	import SaveModal from './modals/SaveModal.svelte';

	export let edits: { id: string; column: string }[];
	export let gridSelectionRowCount: number;
	export let importColumns: string[];

	const dispatch = createEventDispatcher<{
		refresh: undefined;
		export: undefined;
		delete: undefined;
		add: undefined;
		import: Record<string, unknown>[];
		startEditing: undefined;
		endEditing: undefined;
		undoEdits: undefined;
		saveEdits: undefined;
	}>();

	let isInEditMode: boolean;

	$: if (isInEditMode) dispatch('startEditing');
	else dispatch('endEditing');

	let isSaveModalOpen = false;
	let isUndoModalOpen = false;
	let isImportModalOpen = false;
	let isDeleteModalOpen = false;
</script>

<div class="flex flex-wrap gap-1">
	{#if isInEditMode}
		<Button
			kind="primary"
			iconDescription="Save"
			icon={Save}
			on:click={() => (isSaveModalOpen = true)}
		/>
		<Button
			kind="danger"
			iconDescription="Cancel"
			icon={Stop}
			on:click={() => (isUndoModalOpen = true)}
		/>
	{:else}
		<Button
			kind="tertiary"
			iconDescription="Edit"
			icon={Edit}
			on:click={() => (isInEditMode = true)}
		/>
	{/if}
	<Button
		kind="tertiary"
		iconDescription="Add"
		icon={Add}
		disabled={isInEditMode}
		on:click={() => dispatch('add')}
	/>
	<Button
		kind="tertiary"
		iconDescription="Import"
		icon={DocumentImport}
		disabled={isInEditMode || importColumns.length === 0}
		on:click={() => (isImportModalOpen = true)}
	/>
	<Button
		kind="tertiary"
		iconDescription="Export"
		icon={DocumentExport}
		disabled={isInEditMode}
		on:click={() => dispatch('export')}
	/>
	<Button
		kind="danger-tertiary"
		iconDescription="Delete"
		icon={TrashCan}
		disabled={isInEditMode || gridSelectionRowCount === 0}
		on:click={() => (isDeleteModalOpen = true)}
	/>
	<Button
		kind="tertiary"
		iconDescription="Refresh"
		icon={Renew}
		disabled={isInEditMode}
		on:click={() => dispatch('refresh')}
	/>
</div>

<DeleteModal
	bind:open={isDeleteModalOpen}
	{gridSelectionRowCount}
	on:submit={() => dispatch('delete')}
/>

<ImportModal
	bind:open={isImportModalOpen}
	{importColumns}
	on:submit={({ detail }) => dispatch('import', detail)}
/>

<UndoModal
	bind:open={isUndoModalOpen}
	on:submit={() => {
		isInEditMode = false;
		dispatch('undoEdits');
	}}
/>

<SaveModal
	{edits}
	bind:open={isSaveModalOpen}
	on:submit={() => {
		isInEditMode = false;
		dispatch('saveEdits');
	}}
/>
