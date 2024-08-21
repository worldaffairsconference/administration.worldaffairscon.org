import { xata } from '$lib/server/xata';
import type { PartnerSchools } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const partnerSchools = await xata.db.partner_schools.getAll();
	return {
		partnerSchools: partnerSchools as PartnerSchools[],
	};
}) satisfies PageServerLoad;
