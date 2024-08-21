<script lang="ts">
	import EditableTable, { markdownCell } from '$lib/components/EditableTable/EditableTable.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<EditableTable
	title="Frequently Asked Questions"
	tableName="frequently_asked_questions"
	data={data.frequentlyAskedQuestions}
	columnDefinitions={[
		{ field: 'question' },
		{
			field: 'answer',
			maxWidth: 750,
			...markdownCell,
			autoHeight: true,
			wrapText: true,
		},
		{
			field: 'category',
			cellEditor: 'agSelectCellEditor',
			cellEditorParams: { values: Object.keys(data.categories) },
			valueFormatter: (params) => data.categories[params.value] ?? '',
		},
	]}
	importColumns={['question', 'answer']}
/>
