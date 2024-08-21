<script lang="ts">
	import { DataTable } from 'carbon-components-svelte';
	import type { PageData } from './$types';
	import { countBy, groupBy, permute } from '$lib/utils';
	import { onMount } from 'svelte';
	import Papa from 'papaparse';

	export let data: PageData;

	const { attendeePlenaries, attendees, locations, plenaryPreferences, plenaries } = data;

	// const numRankColumns = Math.max(...plenaryPreferences.map((p) => p.counts.length));

	const plenariesByScheduleSlot = Object.values(groupBy(plenaries, (p) => p.scheduleSlot.id));

	class GSPlenary {
		attendees: GSAttendee[] = [];

		constructor(
			public readonly id: string,
			// public location: GSLocation,
			public readonly capacity: number,
			public readonly targetMinimum: number,
			public readonly locationName: string,
		) {}

		get isOverSubscribed() {
			return this.attendees.length > this.capacity;
		}
	}

	class GSAttendee {
		assignedTo: GSPlenary | undefined = undefined;
		readonly originalPreferences: GSPlenary[];

		constructor(
			public readonly id: string,
			public readonly registrationDate: number,
			public preferences: GSPlenary[],
		) {
			this.originalPreferences = [...preferences];
		}

		get isUnassigned() {
			return this.assignedTo === undefined;
		}

		get hasPreferences() {
			return this.preferences.length > 0;
		}

		get assignedRank() {
			return this.assignedTo ? this.originalPreferences.indexOf(this.assignedTo) : Infinity;
		}
	}

	function processScheduleSlot(scheduleSlotPlenaries: typeof plenaries) {
		// const scheduleSlotPlenaries = plenariesByScheduleSlot[i];

		let minScore = Infinity;
		let bestPlenaries: GSPlenary[] = [];
		let bestAttendees: GSAttendee[] = [];

		for (const gsLocations of permute(locations)) {
			if (
				!Object.values(scheduleSlotPlenaries).every((plenary, i) =>
					plenary.location !== null ? plenary.location!.id === gsLocations[i].id : true,
				)
			)
				continue;

			const gsPlenaries = scheduleSlotPlenaries.map(
				(p, i) =>
					new GSPlenary(
						p.id,
						gsLocations[i].capacity ?? 0,
						gsLocations[i].targetMinimum ?? 0,
						gsLocations[i].name ?? 'N / A',
					),
			);
			const gsAttendees = Object.values(
				groupBy(
					attendeePlenaries.filter(
						({ plenary, preferenceRank }) =>
							scheduleSlotPlenaries.find((p) => p.id === plenary.id) &&
							preferenceRank !== undefined,
					),
					({ attendee }) => attendee.id,
				),
			)
				.map((r) => ({
					id: r[0].attendee.id,
					registrationDate: r[0].attendee.emailVerified?.getTime() ?? Infinity,
					preferences: r
						.sort((a, b) => a.preferenceRank! - b.preferenceRank!)
						.map((r) => r.plenary.id),
					firstName: r[0].attendee.firstName,
					lastName: r[0].attendee.lastName,
				}))
				.map(
					(a) =>
						new GSAttendee(
							a.id,
							a.registrationDate,
							a.preferences.map((id) => gsPlenaries.find((p) => p.id === id)!),
						),
				);

			let ri: GSAttendee | undefined = undefined;

			while ((ri = gsAttendees.find((a) => a.isUnassigned && a.hasPreferences))) {
				const hj = ri.preferences.shift()!;
				ri.assignedTo = hj;
				hj.attendees.push(ri);
				hj.attendees.sort((a, b) => a.registrationDate - b.registrationDate);
				if (hj.isOverSubscribed) {
					const rk = hj.attendees.pop()!;
					rk.assignedTo = undefined;
				}
			}

			const score =
				Object.entries(countBy(gsAttendees, (a) => a.assignedRank))
					.map(([rank, count]) => count ** +rank)
					.reduce((acc, curr) => acc + curr, 0) - 1;
			if (score < minScore) {
				minScore = score;
				bestPlenaries = gsPlenaries;
				bestAttendees = gsAttendees;
			}
		}

		for (const attendee of attendees) {
			if (bestAttendees.find((a) => a.id === attendee.id)) continue;
			bestPlenaries.sort(
				(a, b) => a.attendees.length / a.targetMinimum - b.attendees.length / b.targetMinimum,
			);
			const plenary = bestPlenaries.find((p) => p.attendees.length < p.capacity);
			if (plenary) {
				const gsAttendee = new GSAttendee(attendee.id, Infinity, []);
				bestAttendees.push(gsAttendee);
				plenary.attendees.push(gsAttendee);
				gsAttendee.assignedTo = plenary;
			}
		}

		// console.log('===============');
		// console.log(minScore);
		// console.log(countBy(bestAttendees, (a) => a.assignedRank));
		// for (const a of bestPlenaries) {
		// 	const plenary = plenaries.find((p) => p.id === a.id);
		// 	console.log(plenary?.theme, a.attendees.length, a.capacity);
		// }

		return bestAttendees;
	}

	onMount(() => {
		const transaction = plenariesByScheduleSlot
			.map(processScheduleSlot)
			.flatMap((a, i) => a.map((b) => ({ ...b, scheduleSlotIndex: i })))
			.map((a) => {
				if (!a.assignedTo) throw new Error('attendee without plenary');
				const plenaryId = a.assignedTo.id;
				const attendeeId = a.id;
				const row = attendeePlenaries.find(
					(ap) => ap.attendee.id === attendeeId && ap.plenary.id === plenaryId,
				);
				if (row)
					return {
						update: {
							table: 'attendees_plenaries',
							id: row.id,
							fields: { assigned: true },
						},
					};
				return {
					insert: {
						table: 'attendees_plenaries',
						record: { attendee: attendeeId, plenary: plenaryId, assigned: true },
					},
				};
			});

		console.log(JSON.stringify(transaction));

		// const assignments = Object.values(
		// 	groupBy(
		// 		plenariesByScheduleSlot
		// 			.map(processScheduleSlot)
		// 			.flatMap((a, i) => a.map((b) => ({ ...b, scheduleSlotIndex: i }))),
		// 		(a) => a.id,
		// 	),
		// ).map((as) => {
		// 	const id = as[0].id;
		// 	const attendee = attendees.find((a) => a.id === id);
		// 	console.log(attendee?.id, )
		// 	// const obj: Record<string, string> = {
		// 	// 	id,
		// 	// 	firstName: attendee?.firstName ?? 'N / A',
		// 	// 	lastName: attendee?.lastName ?? 'N / A',
		// 	// 	school: attendee?.school?.name ?? 'N / A',
		// 	// };
		// 	// for (const [i, s] of Object.entries(as)) {
		// 	// 	const plenary = plenaries.find((p) => p.id === s.assignedTo?.id);
		// 	// 	obj[`plenary${i}_title`] = plenary?.theme ?? 'N / A';
		// 	// 	obj[`plenary${i}_speaker`] = plenary?.speakers.map((z) => z.name).join(', ') ?? 'N / A';
		// 	// 	obj[`plenary${i}_location`] = s.assignedTo?.locationName ?? 'N / A';
		// 	// }
		// 	return {};
		// });

		// const csv = Papa.unparse(assignments);
		// var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		// var csvURL = window.URL.createObjectURL(csvData);

		// var testLink = document.createElement('a');
		// testLink.href = csvURL;
		// testLink.setAttribute('test', 'test.csv');
		// testLink.click();
	});
</script>

<!-- <div class="w-[700px]">
	<DataTable
		sortable
		zebra
		sortKey="0"
		sortDirection="descending"
		size="compact"
		headers={[
			{ key: 'theme', value: 'Theme', sort: false },
			...new Array(numRankColumns)
				.fill(0)
				.map((_, i) => ({ key: i.toString(), value: `Rank ${i + 1}` })),
		]}
		rows={data.plenaryPreferences.map((p) => ({ id: p.id, theme: p.theme, ...p.counts }))}
	/>
</div> -->
