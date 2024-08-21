import { xata } from '$lib/server/xata';
import type { Attendees } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const attendees = await xata.db.attendees.select(['*', 'school.name']).getAll();
	return {
		attendees: attendees as Attendees[],
	};
}) satisfies PageServerLoad;
