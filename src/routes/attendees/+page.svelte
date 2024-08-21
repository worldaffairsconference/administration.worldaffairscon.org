<script lang="ts">
	import EditableTable, {
		svelteRenderer,
	} from '$lib/components/EditableTable/EditableTable.svelte';

	import type { PageData } from './$types';
	import StatusSymbol from '$lib/components/StatusSymbol.svelte';

	export let data: PageData;

	const warningRenderer = svelteRenderer(
		StatusSymbol,
		'h-full flex items-center justify-center',
		(valid: boolean | null | undefined) => ({ valid: valid ?? false }),
	);
</script>

<EditableTable
	title="Attendees"
	tableName="attendees"
	data={data.attendees}
	importColumns={['firstName', 'lastName', 'email', 'inPerson', 'needsLunch', 'gradeLevel']}
	columnDefinitions={[
		{
			headerName: 'Status',
			cellDataType: 'boolean',
			editable: false,
			valueGetter: (params) =>
				!!params.data?.firstName?.trim() &&
				!!params.data?.lastName?.trim() &&
				!!params.data?.gradeLevel?.trim(),
			cellRenderer: warningRenderer,
		},
		// {
		// 	headerName: 'Name',
		// 	valueGetter: (params) =>
		// 		`${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`.trim(),
		// },
		{ field: 'firstName' },
		{ field: 'lastName' },
		{ field: 'email' },
		{
			field: 'school',
			valueFormatter: ({ value }) => value?.name ?? 'Unspecified',
		},
		{ field: 'inPerson' },
		{ field: 'needsLunch' },
		{ field: 'paid' },
		{
			field: 'gradeLevel',
			valueFormatter: ({ value }) => (/^\d+$/.test(value) ? `Grade ${value}` : value),
		},
		{ field: 'dietaryRestrictions' },
	]}
/>
