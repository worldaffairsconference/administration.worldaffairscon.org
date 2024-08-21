<script lang="ts">
	import type { PageData } from './$types';
	// import PlenaryPreferencesChart from './PlenaryPreferencesChart.svelte';
	import RegistrationsPerDayChart from './RegistrationsPerDayChart.svelte';
	import RegistrationsPerSchoolChart from './RegistrationsPerSchoolChart.svelte';

	export let data: PageData;
</script>

<h3>Welcome to the</h3>
<h1 class="ml-12">World Affairs Conference</h1>
<h2 class="ml-24">Administration dashboard</h2>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
	<RegistrationsPerDayChart data={data.registrationsPerDay} />
	<RegistrationsPerSchoolChart data={data.registrationsPerSchool} />
	<!-- <PlenaryPreferencesChart /> -->
</div>
