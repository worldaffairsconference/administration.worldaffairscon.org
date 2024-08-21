<script context="module" lang="ts">
	import { markdownToText } from '$lib/utils';

	import { MarkdownEditor, markdownRenderer } from './renderers/markdown';

	export { svelteRenderer } from './renderers/svelte';

	export const markdownCell = {
		cellEditor: MarkdownEditor,
		cellRenderer: markdownRenderer,
		comparator: (a: string, b: string) => markdownToText(a).localeCompare(markdownToText(b)),
	};
</script>

<script lang="ts" generics="T extends Identifiable">
	import type { Identifiable } from '@xata.io/client';
	import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community';
	import ms from 'ms';
	import { onMount } from 'svelte';

	import { invalidateAll } from '$app/navigation';
	import { notifications } from '$lib/Notifications.svelte';

	import Toolbar from './Toolbar.svelte';

	export let data: T[];

	export let title: string;
	export let tableName: string;

	export let importColumns: (keyof T & string)[] = [];
	export let columnDefinitions: Exclude<GridOptions<T>['columnDefs'], null | undefined>;

	export let constantColumns: Partial<T> = {};

	$: gridApi?.setGridOption('rowData', data);

	let gridElement: HTMLDivElement | undefined;
	let gridApi: GridApi<T> | undefined;

	let gridSelectionRowCount = 0;

	let edits: Record<
		string,
		{
			id: string;
			column: string;
			oldValue: unknown;
			newValue: unknown;
			rowReference: T;
		}
	> = {};

	onMount(() => {
		if (!gridElement) return;

		gridApi = createGrid(gridElement, {
			rowData: data,

			columnDefs: [
				{
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: true,
					checkboxSelection: true,
					lockPosition: true,
					maxWidth: 48,
				},
				...columnDefinitions,
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

			onSelectionChanged() {
				gridSelectionRowCount = gridApi!.getSelectedRows().length;
			},

			onCellValueChanged(event) {
				const field = event.colDef.field?.toString();
				if (!field) return;

				const edit = {
					oldValue: event.oldValue,
					newValue: event.newValue,
					column: field,
					id: event.data.id,
					rowReference: event.data,
				};

				const editKey = `${edit.id}.${edit.column}`;
				if (edits[editKey] && edits[editKey].oldValue === edit.newValue) delete edits[editKey];
				else edits[`${edit.id}.${edit.column}`] = edit;

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

	async function undoEdits() {
		for (const { rowReference, column, oldValue } of Object.values(edits)) {
			(rowReference as Record<any, any>)[column] = oldValue;
		}
		gridApi?.applyTransaction({ update: Object.values(edits).map((e) => e.rowReference) });
		edits = {};
	}

	async function saveEdits() {
		try {
			const response = await fetch('/api', {
				method: 'POST',
				body: JSON.stringify({
					update: Object.values(edits).map((e) => ({
						table: tableName,
						id: e.id,
						column: e.column,
						value: e.newValue,
					})),
				}),
			});
			if (!response.ok) throw response;
			edits = {};
			await refreshRows();
		} catch {
			notifications.add({
				title,
				subtitle: 'Unable to edit rows',
				caption: 'You may not have the necessary permissions to edits rows in this table.',
				kind: 'error',
			});
		}
	}

	function exportRows() {
		gridApi?.exportDataAsCsv({
			fileName: title,
			columnKeys: gridApi
				.getColumns()
				// This removes the fake column that only contains the checkbox showing the current row selection
				?.filter((c) => !c.getUserProvidedColDef()?.headerCheckboxSelection),
		});
	}

	async function refreshRows() {
		await invalidateAll();
		edits = {};
		gridApi?.refreshCells({ force: true });
		notifications.add({
			title,
			subtitle: 'Refreshed',
			caption: `The table has been refreshed.`,
			kind: 'success',
			timeout: ms('1.5s'),
		});
	}

	async function addRow() {
		try {
			const response = await fetch('/api', {
				method: 'POST',
				body: JSON.stringify({
					add: [{ table: tableName, data: { ...constantColumns } }],
				}),
			});
			if (!response.ok) throw response;
			await refreshRows();
		} catch {
			notifications.add({
				title,
				subtitle: 'Unable to add row',
				caption: 'You may not have the necessary permissions to add a row to this table.',
				kind: 'error',
			});
		}
	}

	async function importRows({ detail: rows }: { detail: Record<string, unknown>[] }) {
		try {
			const response = await fetch('/api', {
				method: 'POST',
				body: JSON.stringify({
					add: rows.map((r) => ({ table: tableName, data: { ...constantColumns, ...r } })),
				}),
			});
			if (!response.ok) throw response;
			await refreshRows();
		} catch {
			notifications.add({
				title,
				subtitle: 'Unable to import rows',
				caption: 'You may not have the necessary permissions to add rows to this table.',
				kind: 'error',
			});
		}
	}

	async function deleteRows() {
		const selectedRows = gridApi?.getSelectedRows();
		if (!selectedRows) return;
		try {
			const response = await fetch('/api', {
				method: 'POST',
				body: JSON.stringify({
					delete: selectedRows.map((r) => ({ table: tableName, id: r.id })),
				}),
			});
			if (!response.ok) throw response;
			await refreshRows();
		} catch {
			notifications.add({
				title,
				subtitle: 'Unable to delete rows',
				caption: 'You may not have the necessary permissions to delete rows from this table.',
				kind: 'error',
			});
		}
	}
</script>

<div class="flex justify-between mb-1 gap-4" on:copy={console.log}>
	<h1 class="flex items-end gap-4">
		{title}
		{#if gridSelectionRowCount > 1}
			<p class="text-gray-400 mb-1">
				{gridSelectionRowCount}&nbsp;selected
			</p>
		{/if}
	</h1>

	<Toolbar
		edits={Object.values(edits)}
		{gridSelectionRowCount}
		{importColumns}
		on:export={exportRows}
		on:refresh={refreshRows}
		on:delete={deleteRows}
		on:add={addRow}
		on:import={importRows}
		on:undoEdits={undoEdits}
		on:saveEdits={saveEdits}
		on:startEditing={() =>
			gridApi?.setGridOption('defaultColDef', {
				...gridApi.getGridOption('defaultColDef'),
				editable: true,
			})}
		on:endEditing={() =>
			gridApi?.setGridOption('defaultColDef', {
				...gridApi.getGridOption('defaultColDef'),
				editable: false,
			})}
	/>
</div>

<div class="ag-theme-quartz grow" bind:this={gridElement} />
