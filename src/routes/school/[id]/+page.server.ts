import { xata } from '$lib/server/xata';
import type { Attendees, PartnerSchools } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async ({ params: { id: schoolId } }) => {
	const [students, school] = await Promise.all([
		xata.db.attendees.filter('school.id', schoolId).select(['*', 'school.name']).getAll(),
		xata.db.partner_schools.filter('id', schoolId).getFirstOrThrow(),
	]);
	return {
		students: (students as Attendees[]).map(({ school, ...student }) => ({
			...student,
			school: school as PartnerSchools,
		})),
		school: school as PartnerSchools,
	};
}) satisfies PageServerLoad;
