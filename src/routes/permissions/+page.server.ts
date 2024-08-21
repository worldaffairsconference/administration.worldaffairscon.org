import { xata } from '$lib/server/xata';
import type { AdministrationUsers } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const administrationUsers = await xata.db.administration_users
		.select(['*', 'canAdministerSchool.*'])
		.getAll();
	return {
		administrationUsers: administrationUsers as AdministrationUsers[],
	};
}) satisfies PageServerLoad;
