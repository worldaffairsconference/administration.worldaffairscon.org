import { fail, redirect } from '@sveltejs/kit';
import { greaterThan } from '@xata.io/client';
import { z } from 'zod';

import { lucia } from '$lib/server/auth';
import { xata } from '$lib/server/xata';

import type { Actions } from './$types';

const schema = z.object({
	email: z.string().email(),
	token: z.string(),
});

export const actions = {
	async default(event) {
		const parsed = schema.safeParse(Object.fromEntries(await event.request.formData()));
		if (!parsed.success) return fail(400);

		const { email, token } = parsed.data;

		const tokenRecord = await xata.db.administration_verification_tokens
			.all(
				xata.db.administration_verification_tokens.filter('user.email', email),
				xata.db.administration_verification_tokens.filter('token', token),
				xata.db.administration_verification_tokens.filter('expiresAt', greaterThan(new Date())),
			)
			.getFirst();

		if (!tokenRecord || !tokenRecord.user) return fail(401);

		await tokenRecord.delete();

		const session = await lucia.createSession(tokenRecord.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});

		redirect(303, `/`);
	},
} satisfies Actions;
