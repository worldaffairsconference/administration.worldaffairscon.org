import {
	type Identifiable,
	lessThanEquals,
	notExists,
	type Repository,
	type SelectedPick,
	type XataRecord,
} from '@xata.io/client';
import type { Adapter, DatabaseSession, DatabaseUser } from 'lucia';

type UserRecord = Identifiable & XataRecord;
type SessionRecord = Identifiable &
	XataRecord & {
		expiresAt?: Date | null | undefined;
		user?: UserRecord | null | undefined;
	};

export class XataAdapterLucia implements Adapter {
	constructor(private sessionsTable: Repository<SessionRecord>) {}

	async getSessionAndUser(
		sessionId: string,
	): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
		const session = await this.sessionsTable
			.filter('id', sessionId)
			.select(['*', 'user.*'])
			.getFirst();

		if (!session || !session.user) return [null, null];

		return [XataAdapterLucia.toLuciaSession(session), XataAdapterLucia.toLuciaUser(session.user)];
	}

	async getUserSessions(userId: string): Promise<DatabaseSession[]> {
		const records = await this.sessionsTable
			.any(this.sessionsTable.filter('user.id', userId))
			.getAll();

		return records
			.map(XataAdapterLucia.toLuciaSession)
			.filter((s): s is DatabaseSession => s !== null);
	}

	async setSession(session: DatabaseSession): Promise<void> {
		await this.sessionsTable.create({
			id: session.id,
			expiresAt: session.expiresAt,
			user: session.userId,
			...session.attributes,
		});
	}

	async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		await this.sessionsTable.update(sessionId, { expiresAt });
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.sessionsTable.delete(sessionId);
	}

	async deleteUserSessions(userId: string): Promise<void> {
		const records = await this.sessionsTable
			.any(
				this.sessionsTable.filter('user.id', userId),
				this.sessionsTable.filter(notExists('user.id')),
			)
			.select(['id'])
			.getAll();
		await this.sessionsTable.delete(records);
	}

	async deleteExpiredSessions(): Promise<void> {
		const records = await this.sessionsTable
			.any(
				this.sessionsTable.filter('expiresAt', lessThanEquals(new Date())),
				this.sessionsTable.filter(notExists('expiresAt')),
			)
			.select(['id'])
			.getAll();
		await this.sessionsTable.delete(records);
	}

	private static toLuciaSession(
		raw: Readonly<SelectedPick<SessionRecord, ['*']>>,
	): DatabaseSession | null {
		const { id, expiresAt, user, ...attributes } = raw;
		if (!expiresAt || !user?.id) return null;
		return {
			id,
			userId: user.id,
			expiresAt,
			attributes: attributes as DatabaseSession['attributes'],
		};
	}

	private static toLuciaUser(raw: Readonly<SelectedPick<UserRecord, ['*']>>): DatabaseUser | null {
		const { id, ...attributes } = raw;
		return {
			id,
			attributes: attributes as DatabaseUser['attributes'],
		};
	}
}
