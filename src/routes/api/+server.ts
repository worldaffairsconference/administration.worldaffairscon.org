import { error, isHttpError, type RequestHandler } from '@sveltejs/kit';
import assert from 'assert';
import { z } from 'zod';

import { xata } from '$lib/server/xata';
import { tables } from '$lib/server/xata.generated';

// TODO: This is a temporary type hack to get zod to derive the correct enum from the Xata schema
// I am virtually certain that there is a cleaner way to do this, but this feature needs to be pushed quickly
// The only two caveats are that
// 		1. The `tables` constant in `$lib/server/xata.generated` must be modified to be exported
// 		2. The Zod schema must be updated to use the `UpdateObjects` and `DeleteObjects` types
// It is important to note that criterion 2 is currently not checked by the type system, so it is possible to forget to update the Zod schema

type ColumnName<T> = T extends (typeof tables)[number]['columns'][number] ? T['name'] : never;
type ColumnNames<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
	? [ColumnName<H>, ...ColumnNames<R>]
	: [];

type UpdateObject<T> = T extends (typeof tables)[number]
	? z.ZodObject<{
			table: z.ZodLiteral<T['name']>;
			id: z.ZodString;
			column: z.ZodEnum<ColumnNames<T['columns']>>;
			value: z.ZodAny;
		}>
	: never;
type UpdateObjects<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
	? [UpdateObject<H>, ...UpdateObjects<R>]
	: [];

type DeleteObject<T> = T extends (typeof tables)[number]
	? z.ZodObject<{ table: z.ZodLiteral<T['name']>; id: z.ZodString }>
	: never;
type DeleteObjects<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
	? [DeleteObject<H>, ...DeleteObjects<R>]
	: [];

type AddObject<T> = T extends (typeof tables)[number]
	? z.ZodObject<{
			table: z.ZodLiteral<T['name']>;
			data: z.ZodRecord<z.ZodEnum<ColumnNames<T['columns']>>, z.ZodAny>;
		}>
	: never;
type AddObjects<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
	? [AddObject<H>, ...AddObjects<R>]
	: [];

const schema = z.object({
	update: z
		.array(
			z.discriminatedUnion(
				'table',
				tables.map((t) =>
					z.object({
						table: z.literal(t.name),
						id: z.string(),
						// @ts-expect-error The type hack below is required to get zod to derive the correct enum from the Xata schema
						column: z.enum(t.columns.map((c) => c.name)),
						value: z.any(),
					}),
				) as UpdateObjects<typeof tables>,
			),
		)
		.default([]),
	delete: z
		.array(
			z.discriminatedUnion(
				'table',
				tables.map((t) => z.object({ table: z.literal(t.name), id: z.string() })) as DeleteObjects<
					typeof tables
				>,
			),
		)
		.default([]),
	add: z
		.array(
			z.discriminatedUnion(
				'table',
				tables.map((t) =>
					z.object({
						table: z.literal(t.name),
						// @ts-expect-error The type hack below is required to get zod to derive the correct enum from the Xata schema
						data: z.record(z.enum(t.columns.map((c) => c.name)), z.any()),
					}),
				) as AddObjects<typeof tables>,
			),
		)
		.default([]),
});

export const POST: RequestHandler = async ({ request, locals: { user } }) => {
	assert.ok(user);
	try {
		const transaction = schema.parse(await request.json());

		for (const { table, column, id } of transaction.update)
			switch (table) {
				case 'attendees':
					switch (column) {
						case 'firstName':
						case 'lastName':
						case 'school':
						case 'inPerson':
						case 'needsLunch':
						case 'gradeLevel':
						case 'dietaryRestrictions':
							if (user.permissions.canUpdateAttendees) break;
							// TODO: Find a more efficient way of doing this
							if (user.permissions.canAdministerSchool) {
								const row = await xata.db.attendees
									.filter('id', id)
									.filter('school.id', user.permissions.canAdministerSchool.id)
									.getFirst();
								if (row) break;
							}
							throw error(401);

						case 'paid':
							if (user.permissions.canUpdateFinancialData) break;
							throw error(401);

						default:
							throw error(401);
					}
					break;

				case 'partner_schools':
					if (user.permissions.canUpdateSchools) break;
					throw error(401);

				case 'plenaries':
				case 'speakers':
					if (user.permissions.canUpdatePlenaries) break;
					throw error(401);

				case 'frequently_asked_questions':
					if (user.permissions.canUpdateFrequentlyAskedQuestions) break;
					throw error(401);

				case 'administration_users':
					if (user.permissions.canEditPermissions) break;
					throw error(401);

				default:
					error(401);
			}

		for (const { table, id } of transaction.delete)
			switch (table) {
				case 'attendees':
					if (user.permissions.canDeleteAttendees) break;
					// TODO: Find a more efficient way of doing this
					if (user.permissions.canAdministerSchool) {
						const row = await xata.db.attendees
							.filter('id', id)
							.filter('school.id', user.permissions.canAdministerSchool.id)
							.getFirst();
						if (row) break;
					}
					throw error(401);

				case 'partner_schools':
					if (user.permissions.canDeleteSchools) break;
					throw error(401);

				case 'plenaries':
				case 'speakers':
					if (user.permissions.canDeletePlenaries) break;
					throw error(401);

				case 'frequently_asked_questions':
					if (user.permissions.canDeleteFrequentlyAskedQuestions) break;
					throw error(401);

				case 'administration_users':
					if (user.permissions.canEditPermissions) break;
					throw error(401);

				default:
					error(401);
			}

		for (const { table, data } of transaction.add)
			switch (table) {
				case 'attendees':
					if (user.permissions.canAddAttendees) break;
					if (
						user.permissions.canAdministerSchool &&
						user.permissions.canAdministerSchool.id === data.school?.id
					)
						break;
					throw error(401);

				case 'partner_schools':
					if (user.permissions.canAddSchools) break;
					throw error(401);

				case 'plenaries':
				case 'speakers':
					if (user.permissions.canAddPlenaries) break;
					throw error(401);

				case 'frequently_asked_questions':
					if (user.permissions.canAddFrequentlyAskedQuestions) break;
					throw error(401);

				case 'administration_users':
					if (user.permissions.canEditPermissions) break;
					throw error(401);

				default:
					error(401);
			}

		const status = await xata.transactions.run([
			...transaction.update.map(({ table, id, column, value }) => ({
				update: { table, id, fields: { [column]: value.id ?? value } },
			})),
			...transaction.delete.map(({ table, id }) => ({
				delete: { table, id },
			})),
			...transaction.add.map(({ table, data }) => ({
				insert: {
					table,
					record: Object.fromEntries(
						Object.entries(data).map(([key, value]) => [key, value.id ?? value]),
					),
				},
			})),
		]);

		return new Response(JSON.stringify(status), { status: 200 });
	} catch (e) {
		console.log(e);
		if (isHttpError(e)) throw e;
		throw error(400);
	}
};
