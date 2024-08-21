<script lang="ts">
	import 'chartjs-adapter-moment';

	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	export let data: PageData['registrationsPerDay'];

	let canvasElement: HTMLCanvasElement | undefined;

	onMount(() => {
		if (!canvasElement) return;

		new Chart(canvasElement, {
			type: 'line',
			options: {
				plugins: {
					legend: {
						display: false,
					},
				},
				responsive: true,
				maintainAspectRatio: false,
				devicePixelRatio: 4,
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day',
							tooltipFormat: 'dddd, MMMM Do',
						},
					},
					y: {
						min: 0,
					},
				},
				// animation: false,
			},
			data: {
				labels: data.map((r) => r.date),
				datasets: [
					{
						label: 'Registrations per day',
						data: data.map((r) => r.registrations),
						tension: 0.4,
					},
				],
			},
		});
	});
</script>

<div>
	<h4 class="text-center">Registrations per Day</h4>
	<div class="w-full h-[50vh]"><canvas bind:this={canvasElement} /></div>
</div>
