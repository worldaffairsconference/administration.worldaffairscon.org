import { xata } from '$lib/server/xata';
import type {
	Attendees,
	AttendeesPlenaries,
	Locations,
	Plenaries,
	ScheduleSlots,
	Speakers,
} from '$lib/server/xata.generated';
import { groupBy } from '$lib/utils';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const [{ summaries: plenaryPreferences }, attendeePlenaries, attendees, plenaries, locations] =
		await Promise.all([
			xata.db.attendees_plenaries.summarize({
				columns: ['plenary.id', 'preferenceRank'],
				summaries: {
					count: { count: '*' },
				},
				pagination: {
					size: 1000,
				},
			}),
			xata.db.attendees_plenaries
				.select(['preferenceRank', 'plenary.id', 'attendee.id', 'attendee.emailVerified'])
				.getAll(),
			xata.db.attendees.select(['*', 'school.*']).getAll(),
			xata.db.plenaries
				.filter('confirmed', true)
				.select([
					'*',
					{
						name: '<-speakers.plenary',
						as: 'speakers',
						columns: ['*'],
					},
				])
				.getAll(),
			xata.db.locations.getAll(),
		]);

	return {
		attendeePlenaries: (attendeePlenaries as AttendeesPlenaries[]).map(
			({ id, attendee, plenary, preferenceRank }) => ({
				id,
				attendee: attendee as Attendees,
				plenary: plenary as Plenaries,
				preferenceRank,
			}),
		),
		attendees: attendees as Attendees[],
		plenaries: (
			plenaries as unknown as (Plenaries & { speakers: { records: Speakers[] } })[]
		).flatMap(({ scheduleSlot, speakers, ...plenary }) =>
			scheduleSlot
				? [
						{
							...plenary,
							scheduleSlot: scheduleSlot as ScheduleSlots,
							speakers: speakers.records,
						},
					]
				: [],
		),
		locations: locations as Locations[],
		plenaryPreferences: Object.values(
			groupBy(
				plenaryPreferences.flatMap(({ plenary, preferenceRank, count }) =>
					plenary ? [{ plenary, preferenceRank, count }] : [],
				),
				(p) => p.plenary.id,
			),
		).map((p, i) => {
			const id = p[0].plenary.id;
			return {
				id: id,
				theme: plenaries.find((p) => p.id === id)?.theme ?? `Plenary ${i + 1}`,
				counts: p
					.sort((a, b) => (a.preferenceRank ?? Infinity) - (b.preferenceRank ?? Infinity))
					.map((p) => p.count),
			};
		}),
	};
}) satisfies PageServerLoad;
