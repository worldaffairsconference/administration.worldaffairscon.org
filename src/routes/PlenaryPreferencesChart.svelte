<!-- <script lang="ts">
	import * as d3 from 'd3';

	let data = d3.ticks(-2, 2, 200).map(Math.sin);

	function onMousemove(event) {
		const [x, y] = d3.pointer(event);
		data = data.slice(-200).concat(Math.atan2(x, y));
	}

	let width = 640;
	let height = 400;

	let chartContainer: HTMLDivElement;

	export let marginTop = 20;
	export let marginRight = 20;
	export let marginBottom = 30;
	export let marginLeft = 40;

	let gx: SVGGElement;
	let gy: SVGGElement;

	$: x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
	$: y = d3.scaleLinear(d3.extent(data) as [number, number], [height - marginBottom, marginTop]);
	$: line = d3.line((d, i) => x(i), y);
	$: d3.select(gy).call(d3.axisLeft(y));
	$: d3.select(gx).call(d3.axisBottom(x));
</script>

<svelte:window
	on:resize={(e) => {
		width = chartContainer.getBoundingClientRect().width;
		height = chartContainer.getBoundingClientRect().height;
	}}
/>

<div class="w-full h-[300px]" bind:this={chartContainer} on:mousemove={onMousemove}>
	<svg {width} {height}>
		<g bind:this={gx} transform="translate(0,{height - marginBottom})" />
		<g bind:this={gy} transform="translate({marginLeft},0)" />
		<path fill="none" stroke="currentColor" stroke-width="1.5" d={line(data)} />
		<g fill="white" stroke="currentColor" stroke-width="1.5">
			{#each data as d, i}
				<circle key={i} cx={x(i)} cy={y(d)} r="2.5" fill="white" />
			{/each}
		</g>
	</svg>
</div> -->

<!-- <script lang="ts">
	import * as d3 from 'd3';

	let width = 500;

	const numNodes = 100;
	let nodes = d3.range(numNodes).map(() => ({ radius: Math.random() * 25 }));

	const simulation = d3
		.forceSimulation(nodes)
		.force('charge', d3.forceManyBody().strength(5))
		.force('center', d3.forceCenter(width / 2, width / 2))
		.force(
			'collision',
			d3.forceCollide().radius((n) => n.radius),
		)
		.on('tick', () => (nodes = nodes));
	// .on('end', () => {
	// 	console.log(nodes.map((node) => `${node.x} ${node.y}`));
	// });

	let gx: SVGGElement;
	let gy: SVGGElement;
	const margin = 10;
</script>

<svg {width} height={width}>
	 {#each links as link}
		<line
			x1={x(link.source.x)}
			x2={x(link.target.x)}
			y1={y(link.source.y)}
			y2={y(link.target.y)}
			stroke="black"
			stroke-width={link.weight}
		/>
	{/each}
	<g fill="white" stroke="currentColor" stroke-width="1.5">
		{#each nodes as node}
			<circle cx={node.x ?? 0} cy={node.y ?? 0} r={node.radius} fill="white" />
		{/each}
	</g>
</svg> -->

<script lang="ts">
	import * as d3 from 'd3';

	let width = 500;
	let height = 500;

	const plenaries = [
		{
			name: 'Plenary 1',
			id: Math.random(),
			fx: 0 + 15,
			fy: 0 + 15,
			mu: 50,
			sigma: 1,
		},
		{
			name: 'Plenary 2',
			id: Math.random(),
			fx: width - 15,
			fy: 0 + 15,
			mu: 30,
			sigma: 10,
		},
		{
			name: 'Plenary 3',
			id: Math.random(),
			fx: width - 15,
			fy: height - 15,
			mu: 0,
			sigma: 100,
		},
		{
			name: 'Plenary 4',
			id: Math.random(),
			fx: 0 + 15,
			fy: height - 15,
			mu: 20,
			sigma: 20,
		},
	];

	const attendees = new Array(1000).fill(0).map(() => ({
		preferences: plenaries
			.map((p) => ({ ...p, score: d3.randomNormal(p.mu, p.sigma)() }))
			.sort((a, b) => a.score - b.score),
		id: Math.random(),
		name: 'Attendee ' + Math.random(),
	}));

	type Node = d3.SimulationNodeDatum & { id: number; radius: number; name: string };

	let nodes = [
		...plenaries.map((plenary) => ({ ...plenary, radius: 10 })),
		...attendees.map((attendee) => ({ ...attendee, radius: 2 })),
	] as Node[];

	let links = attendees.flatMap((a) =>
		a.preferences.map((p, i) => ({ source: a.id, target: p.id, weight: i + 1 })),
	);

	d3.forceSimulation(nodes)
		// .force('charge', d3.forceManyBody().strength(-5))
		.force(
			'link',
			d3
				.forceLink(links)
				.id((d) => (d as Node).id)
				.distance(0)
				.strength((d) => 1 / d.weight),
		)
		.force(
			'collision',
			d3
				.forceCollide()
				.radius((n) => (n as Node).radius)
				.strength(1),
		)
		.on('tick', () => {
			nodes = nodes;
			links = links;
		});
</script>

<svg {width} {height}>
	{#each links as link}
		<line
			x1={link.source.x}
			x2={link.target.x}
			y1={link.source.y}
			y2={link.target.y}
			stroke="black"
			opacity={0.05 / link.weight}
			stroke-width="3"
		/>
	{/each}
	<g fill="white" stroke="currentColor" stroke-width="1.5">
		{#each nodes as node}
			<circle cx={node.x} cy={node.y} r={node.radius} fill="white" />
		{/each}
	</g>
</svg>
