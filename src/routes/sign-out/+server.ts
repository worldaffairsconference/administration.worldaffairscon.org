import { redirect } from '@sveltejs/kit';

import { lucia } from '$lib/server/auth';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	if (event.locals.session) {
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});
	}

	redirect(302, '/sign-in/email');
};
