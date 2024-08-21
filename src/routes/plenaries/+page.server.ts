import { xata } from '$lib/server/xata';
import type { PlenariesRecord, SpeakersRecord } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const plenaries = await xata.db.plenaries
		.select(['*', 'scheduleSlot.*', { name: '<-speakers.plenary', columns: ['*'], as: 'speakers' }])
		.getAll();
	return {
		plenaries: plenaries.map(({ scheduleSlot, speakers, ...plenary }) => ({
			...(plenary as PlenariesRecord),
			scheduleSlot,
			speakers: speakers.records as SpeakersRecord[],
		})),
	};
}) satisfies PageServerLoad;
