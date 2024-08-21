<script lang="ts">
	import { createGrid, type GridApi } from 'ag-grid-community';
	import { Button, Modal } from 'carbon-components-svelte';
	import { Add, Edit, Renew, Save, Stop, TrashCan } from 'carbon-icons-svelte';
	import ms from 'ms';
	import { onMount } from 'svelte';

	import { invalidateAll } from '$app/navigation';
	import { notifications } from '$lib/Notifications.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	let gridElement: HTMLDivElement | undefined;
	let gridApi: GridApi<(typeof data)['partnerSchools'][number]> | undefined;
	let gridSelectionCount = 0;

	type Columns = (typeof data)['partnerSchools'][number];
	type ColumnNames = keyof Columns;
	type Edit<T> = T extends keyof Columns
		? {
				id: string;
				column: T;
				oldValue: Columns[T];
				newValue: Columns[T];
				rowReference: Columns;
			}
		: never;

	let edits: Record<string, Edit<ColumnNames>> = {};
	let editMode = false;
	$: gridApi?.setGridOption('defaultColDef', {
		...gridApi.getGridOption('defaultColDef'),
		editable: editMode,
	});

	let cancelModalOpen = false;
	let saveModalOpen = false;

	$: gridApi?.setGridOption('rowData', data.partnerSchools);

	onMount(() => {
		if (!gridElement) return;

		gridApi = createGrid(gridElement, {
			rowData: data.partnerSchools,
			columnDefs: [
				{
					field: 'name',
					headerCheckboxSelectionFilteredOnly: true,
					headerCheckboxSelection: true,
					checkboxSelection: true,
					lockPosition: true,
				},
				{
					field: 'domain',
				},
				{
					headerName: 'Student Privileges',
					children: [
						{ field: 'allowsSelfRegistration', headerName: 'Registration' },
						{ field: 'allowsSelfMealPurchase', headerName: 'Meal Purchase' },
					],
				},
			],
			defaultColDef: {
				filter: true,
				cellClass(cell) {
					if (
						Object.values(edits).some(
							(e) => e.id === cell.data?.id && e.column === cell.colDef.field,
						)
					)
						return 'modified';
				},
			},
			autoSizeStrategy: {
				type: 'fitCellContents',
			},
			rowSelection: 'multiple',
			onSelectionChanged(e) {
				gridSelectionCount = e.api.getSelectedNodes().length;
			},
			onCellValueChanged(event) {
				const edit: Edit<ColumnNames> = {
					oldValue: event.oldValue,
					newValue: event.newValue,
					column: event.colDef.field!,
					id: event.data.id,
					rowReference: event.data,
				};
				const editKey = `${edit.id}.${edit.column}`;
				if (edits[editKey] && edits[editKey].oldValue === edit.newValue) {
					delete edits[editKey];
				} else {
					edits[`${edit.id}.${edit.column}`] = edit;
				}
				event.api.refreshCells({
					columns: [event.column.getId()],
					rowNodes: [event.node],
					force: true,
				});
			},
			getRowId(params) {
				return params.data.id;
			},
		});
	});

	async function refresh() {
		await invalidateAll();
		notifications.add({
			title: 'Partner Schools',
			subtitle: 'Refreshed',
			caption: 'Partner schools have been refreshed.',
			kind: 'success',
			timeout: ms('1s'),
		});
	}

	async function edit() {
		editMode = true;
	}

	async function save() {
		editMode = false;
		edits = {};
	}

	function cancel() {
		editMode = false;
		for (const { rowReference, column, oldValue } of Object.values(edits)) {
			// @ts-ignore
			rowReference[column] = oldValue;
		}
		gridApi?.applyTransaction({ update: Object.values(edits).map((e) => e.rowReference) });
		edits = {};
	}
</script>

<div class="flex justify-between mb-1">
	<h1 class="flex items-end gap-4">
		Partner Schools
		{#if gridSelectionCount > 1}
			<p class="text-gray-400 mb-1">
				{gridSelectionCount} selected
			</p>
		{/if}
	</h1>

	<div>
		{#if editMode}
			<Button
				kind="primary"
				iconDescription="Save"
				icon={Save}
				on:click={() => (saveModalOpen = true)}
			/>
			<Button
				kind="danger"
				iconDescription="Cancel"
				icon={Stop}
				on:click={() => (cancelModalOpen = true)}
			/>
		{:else}
			<Button kind="tertiary" iconDescription="Edit" icon={Edit} on:click={edit} />
		{/if}
		<Button kind="tertiary" iconDescription="Add" icon={Add} disabled={editMode} />
		<Button kind="danger-tertiary" iconDescription="Delete" icon={TrashCan} disabled={editMode} />
		<Button
			kind="tertiary"
			iconDescription="Refresh"
			icon={Renew}
			on:click={refresh}
			disabled={editMode}
		/>
	</div>
</div>

<div class="ag-theme-quartz grow" bind:this={gridElement} />

<Modal
	danger
	bind:open={cancelModalOpen}
	modalHeading="Undo all changes"
	primaryButtonText="Cancel"
	secondaryButtonText="Undo"
	on:click={() => (cancelModalOpen = false)}
	on:click:button--primary={cancel}
>
	<p>This is a permanent action and cannot be undone.</p>
</Modal>

<Modal
	bind:open={saveModalOpen}
	modalHeading="Commit all changes"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click={() => (saveModalOpen = false)}
	on:click:button--primary={save}
>
	<p>
		Are you certain you want to commit these {Object.values(edits).length} changes across {new Set(
			Object.values(edits).map((e) => e.id),
		).size} rows and {new Set(Object.values(edits).map((e) => e.column)).size} columns?
	</p>
</Modal>
