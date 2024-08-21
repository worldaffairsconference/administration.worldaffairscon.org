import { type Handle, redirect } from '@sveltejs/kit';

import { getAllowedRoutes, lucia } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;

		const allowedRoutes = getAllowedRoutes();
		if (!allowedRoutes.includes(event.url.pathname)) redirect(302, allowedRoutes[0]);

		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	const allowedRoutes = getAllowedRoutes(user?.permissions);
	if (!allowedRoutes.includes(event.url.pathname)) redirect(303, allowedRoutes[0]);

	return resolve(event);
};
