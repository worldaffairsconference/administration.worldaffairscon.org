<script lang="ts">
	import EditableTable from '$lib/components/EditableTable/EditableTable.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<EditableTable
	title="Permissions"
	tableName="administration_users"
	data={data.administrationUsers}
	columnDefinitions={[
		// {
		// 	headerName: 'Name',
		// 	valueGetter: (params) =>
		// 		`${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`.trim(),
		// },
		{ field: 'firstName' },
		{ field: 'lastName' },
		{ field: 'email' },
		{ field: 'canViewSummaryStatistics', headerName: 'View Summary Statistics' },
		{
			field: 'canAdministerSchool',
			headerName: 'Administers School',
			valueFormatter: ({ value }) => value?.name,
		},
		{ field: 'canEditPermissions', headerName: 'Edit Permissions' },
		{ field: 'canUpdateFinancialData', headerName: 'Financial Data' },
		{
			headerName: 'Attendees',
			children: [
				{ field: 'canViewAttendees', headerName: 'View' },
				{ field: 'canAddAttendees', headerName: 'Add' },
				{ field: 'canUpdateAttendees', headerName: 'Update' },
				{ field: 'canDeleteAttendees', headerName: 'Delete' },
			],
		},
		{
			headerName: 'Schools',
			children: [
				{ field: 'canViewSchools', headerName: 'View' },
				{ field: 'canAddSchools', headerName: 'Add' },
				{ field: 'canUpdateSchools', headerName: 'Update' },
				{ field: 'canDeleteSchools', headerName: 'Delete' },
			],
		},
		{
			headerName: 'Plenaries',
			children: [
				{ field: 'canViewPlenaries', headerName: 'View' },
				{ field: 'canAddPlenaries', headerName: 'Add' },
				{ field: 'canUpdatePlenaries', headerName: 'Update' },
				{ field: 'canDeletePlenaries', headerName: 'Delete' },
			],
		},
		{
			headerName: 'Plenary Assignments',
			children: [
				{ field: 'canViewPlenaryAssignments', headerName: 'View' },
				{ field: 'canGeneratePlenaryAssignments', headerName: 'Generate' },
			],
		},
		{
			headerName: 'FrequentlyAskedQuestions',
			children: [
				{ field: 'canViewFrequentlyAskedQuestions', headerName: 'View' },
				{ field: 'canAddFrequentlyAskedQuestions', headerName: 'Add' },
				{ field: 'canUpdateFrequentlyAskedQuestions', headerName: 'Update' },
				{ field: 'canDeleteFrequentlyAskedQuestions', headerName: 'Delete' },
			],
		},
	]}
/>
