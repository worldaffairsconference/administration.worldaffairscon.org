<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	export let data: PageData['registrationsPerSchool'];

	let canvasElement: HTMLCanvasElement | undefined;

	onMount(() => {
		if (!canvasElement) return;

		new Chart(canvasElement, {
			type: 'doughnut',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				devicePixelRatio: 4,
				// animation: false,
			},
			data: {
				labels: data.map((r) => r.school),
				datasets: [
					{
						label: 'Registrations per School',
						data: data.map((r) => r.registrations),
					},
				],
			},
			plugins: [
				// The code for rendering the total number of registrations in the center of the doughnut chart is heavily inspired by https://codepen.io/stockinail/pen/eYjRgXV
				{
					id: 'innerLabel',
					afterDatasetDraw(chart, { meta }) {
						const { ctx } = chart;
						const xCoor = meta.data[0].x;
						const yCoor = meta.data[0].y;
						console.log(meta);
						ctx.save();
						ctx.textAlign = 'center';
						ctx.font = "32px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
						ctx.fillStyle = '#666';
						// @ts-ignore
						ctx.fillText(meta.total, xCoor, yCoor);
						ctx.restore();
					},
				},
			],
		});
	});
</script>

<div>
	<h4 class="text-center">Registrations per School</h4>
	<div class="w-full h-[50vh]"><canvas bind:this={canvasElement} /></div>
</div>
