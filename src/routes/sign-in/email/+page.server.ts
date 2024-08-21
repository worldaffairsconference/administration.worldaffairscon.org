import { fail, redirect } from '@sveltejs/kit';
import { lessThanEquals, notExists } from '@xata.io/client';
import { createDate,TimeSpan } from 'oslo';
import { alphabet,generateRandomString } from 'oslo/crypto';
import { z } from 'zod';

import { MAILGUN_DOMAIN, MAILGUN_FROM } from '$env/static/private';
import { mg } from '$lib/server/email';
import { xata } from '$lib/server/xata';

import type { Actions } from './$types';

const schema = z.object({
	email: z.string().email(),
});

export const actions = {
	async default(event) {
		const parsed = schema.safeParse(Object.fromEntries(await event.request.formData()));
		if (!parsed.success) return fail(400);

		const { email } = parsed.data;
		const user = await xata.db.administration_users.filter('email', email).getFirst();
		if (!user) return fail(401);

		const pastTokens = await xata.db.administration_verification_tokens
			.any(
				xata.db.administration_verification_tokens.filter('user', user.id),
				xata.db.administration_verification_tokens.filter(notExists('user.id')),
				xata.db.administration_verification_tokens.filter('expiresAt', lessThanEquals(new Date())),
			)
			.getAll();
		await xata.db.administration_verification_tokens.delete(pastTokens);

		const token = generateRandomString(24, alphabet('0-9', 'A-Z', 'a-z'));
		await xata.db.administration_verification_tokens.create({
			user,
			token,
			expiresAt: createDate(new TimeSpan(5, 'm')),
		});

		await mg.messages.create(MAILGUN_DOMAIN, {
			from: MAILGUN_FROM,
			to: email,
			subject: 'Sign in',
			text: `Your requested token is ${token}`,
		});

		redirect(303, `/sign-in/token?${new URLSearchParams({ email })}`);
	},
} satisfies Actions;
