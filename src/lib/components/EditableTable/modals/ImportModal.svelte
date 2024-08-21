<script lang="ts">
	import {
		FileUploaderButton,
		FormGroup,
		Modal,
		Select,
		SelectItem,
		SelectSkeleton,
	} from 'carbon-components-svelte';
	import Papa, { type ParseResult } from 'papaparse';
	import prettyBytes from 'pretty-bytes';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let importColumns: string[];

	const dispatch = createEventDispatcher<{ submit: Record<string, unknown>[] }>();

	let files: [] | [File] = [];
	$: file = files[0];
	$: parsed = new Promise<ParseResult<unknown>>(
		(resolve, reject) =>
			file &&
			Papa.parse<unknown, File>(file, {
				header: true,
				dynamicTyping: true,
				complete: resolve,
				error: reject,
			}),
	);

	$: if (!open) files = [];

	let mapping: Record<string, string> = {};
	$: ready = Object.values(mapping).filter((s) => !!s).length === importColumns.length;

	async function importRows() {
		const { data } = await parsed;
		const keys = Object.keys(mapping);
		dispatch(
			'submit',
			data.map((row) =>
				Object.fromEntries(
					keys.map((key) => [key, (row as Record<string, unknown>)?.[mapping[key]]]),
				),
			),
		);
	}
</script>

<Modal
	bind:open
	modalHeading="Import from CSV"
	primaryButtonText="Import"
	secondaryButtonText="Cancel"
	hasForm={true}
	on:click:button--secondary={() => (open = false)}
	on:click:button--primary={() => (open = false)}
	primaryButtonDisabled={!ready}
	on:submit={importRows}
>
	<FormGroup legendText="Input CSV file" class="flex justify-between items-center">
		<FileUploaderButton
			labelText="Add file"
			accept={['.csv']}
			kind="tertiary"
			size="default"
			bind:files
		/>

		<div>
			{#if file}
				{#await parsed then parsed}
					<p class="text-sm text-right">{prettyBytes(file.size)}</p>
					<p class="text-sm text-right">
						{parsed.meta.fields?.length} columns &horbar; {parsed.data.length - 1} rows
					</p>
				{/await}
			{/if}
		</div>
	</FormGroup>

	<FormGroup legendText="Column mappings" class="flex flex-col gap-4 mb-0">
		{#each importColumns as column, i}
			{#await parsed}
				<SelectSkeleton />
			{:then parsed}
				<Select labelText={column} bind:selected={mapping[column]}>
					<SelectItem text="Select a column" disabled hidden />
					{#each parsed.meta.fields ?? [] as field}
						<SelectItem value={field} />
					{/each}
				</Select>
			{/await}
		{/each}
	</FormGroup>
</Modal>
