import { xata } from '$lib/server/xata';
import type { FrequentlyAskedQuestions } from '$lib/server/xata.generated';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const frequentlyAskedQuestions = await xata.db.frequently_asked_questions.getAll();
	const categories = await xata.db.frequently_asked_questions_categories.getAll();
	return {
		frequentlyAskedQuestions: (frequentlyAskedQuestions as FrequentlyAskedQuestions[]).map((q) => ({
			...q,
			category: q.category?.id,
		})),
		categories: Object.fromEntries(categories.map((c) => [c.id, c.name])),
	};
}) satisfies PageServerLoad;
