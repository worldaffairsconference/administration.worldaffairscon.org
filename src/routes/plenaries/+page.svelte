<script lang="ts">
	import EditableTable, { markdownCell } from '$lib/components/EditableTable/EditableTable.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<EditableTable
	data={data.plenaries}
	title="Frequently Asked Questions"
	tableName="frequently_asked_questions"
	columnDefinitions={[
		{ field: 'theme' },
		{
			field: 'scheduleSlot',
			valueFormatter: ({ value }) =>
				`${value?.startTime?.toLocaleTimeString([], {
					hour: 'numeric',
					minute: 'numeric',
				})} - ${value?.endTime?.toLocaleTimeString([], {
					hour: 'numeric',
					minute: 'numeric',
				})}`,
		},
		{
			field: 'speakers',
			valueGetter: ({ data }) => data?.speakers.map((s) => s.name).sort(),
			valueFormatter: ({ value }) => value.join(', '),
		},
	]}
/>
