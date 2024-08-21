import { xata } from '$lib/server/xata';

import type { PageServerLoad } from './$types';

async function getRegistrationsPerSchool() {
	const data = await xata.db.attendees.summarize({
		columns: ['school.name'],
		summaries: {
			attendees: { count: '*' },
		},
		sort: [{ attendees: 'desc' }],
		pagination: {
			size: 1000,
		},
	});
	return (
		data.summaries
			.map((r) => ({
				school: r.school?.name,
				registrations: r.attendees,
			}))
			// // TODO: Replace with .toSorted once it's available
			// .sort((a, b) => {
			// 	if (!a.school) return 1;
			// 	if (!b.school) return -1;
			// 	return a.school.localeCompare(b.school);
			// })
			.map((r) => ({ school: r.school ?? 'Unknown', registrations: r.registrations }))
	);
}

async function getRegistrationsPerDay() {
	const data = await xata.db.attendees.aggregate({
		byDay: {
			dateHistogram: {
				column: 'emailVerified',
				calendarInterval: 'day',
			},
		},
	});
	return data.aggs.byDay.values.map((r) => ({
		date: r.$key,
		registrations: r.$count,
	}));
}

export const load = (async () => {
	const [registrationsPerSchool, registrationsPerDay] = await Promise.all([
		getRegistrationsPerSchool(),
		getRegistrationsPerDay(),
	]);
	return { registrationsPerSchool, registrationsPerDay };
}) satisfies PageServerLoad;
