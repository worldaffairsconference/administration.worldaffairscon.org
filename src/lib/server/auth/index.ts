import { Lucia, type User } from 'lucia';

import { dev } from '$app/environment';
import { xata } from '$lib/server/xata';
import type { AdministrationSessions, AdministrationUsers } from '$lib/server/xata.generated';

import { XataAdapterLucia } from './adapter';

export const lucia = new Lucia(new XataAdapterLucia(xata.db.administration_sessions), {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes(attributes) {
		return {
			firstName: attributes.firstName ?? undefined,
			lastName: attributes.lastName ?? undefined,
			permissions: {
				canAdministerSchool: attributes.canAdministerSchool
					? {
							id: attributes.canAdministerSchool.id,
							name: attributes.canAdministerSchool.name,
						}
					: undefined,

				canViewAttendees: attributes.canViewAttendees ?? false,
				canAddAttendees: attributes.canAddAttendees ?? false,
				canUpdateAttendees: attributes.canUpdateAttendees ?? false,
				canDeleteAttendees: attributes.canDeleteAttendees ?? false,

				canUpdateFinancialData: attributes.canUpdateFinancialData ?? false,

				canEditPermissions: attributes.canEditPermissions ?? false,

				canViewFrequentlyAskedQuestions: attributes.canViewFrequentlyAskedQuestions ?? false,
				canAddFrequentlyAskedQuestions: attributes.canAddFrequentlyAskedQuestions ?? false,
				canUpdateFrequentlyAskedQuestions: attributes.canUpdateFrequentlyAskedQuestions ?? false,
				canDeleteFrequentlyAskedQuestions: attributes.canDeleteFrequentlyAskedQuestions ?? false,

				canViewPlenaries: attributes.canViewPlenaries ?? false,
				canAddPlenaries: attributes.canAddPlenaries ?? false,
				canUpdatePlenaries: attributes.canUpdatePlenaries ?? false,
				canDeletePlenaries: attributes.canDeletePlenaries ?? false,

				canViewSchools: attributes.canViewSchools ?? false,
				canAddSchools: attributes.canAddSchools ?? false,
				canUpdateSchools: attributes.canUpdateSchools ?? false,
				canDeleteSchools: attributes.canDeleteSchools ?? false,

				canViewSummaryStatistics: attributes.canViewSummaryStatistics ?? false,

				canGeneratePlenaryAssignments: attributes.canGeneratePlenaryAssignments ?? false,
				canViewPlenaryAssignments: attributes.canViewPlenaryAssignments ?? false,
			},
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
	interface DatabaseSessionAttributes
		extends Omit<AdministrationSessions, 'id' | 'expiresAt' | 'user'> {}
	interface DatabaseUserAttributes extends Omit<AdministrationUsers, 'id'> {}
}

export function getAllowedRoutes(permissions?: User['permissions'] | undefined) {
	const routes = new Array<string>();
	if (permissions?.canViewSummaryStatistics) routes.push('/');
	if (permissions?.canAdministerSchool)
		routes.push(`/school/${permissions.canAdministerSchool.id}`);
	if (permissions?.canViewAttendees) routes.push('/attendees');
	if (permissions?.canViewSchools) routes.push('/partner-schools');
	if (permissions?.canViewPlenaries) routes.push('/plenaries');
	if (permissions?.canViewFrequentlyAskedQuestions) routes.push('/frequently-asked-questions');
	if (permissions?.canViewPlenaryAssignments) routes.push('/plenary-assignments');
	if (permissions?.canEditPermissions) routes.push('/permissions');
	if (permissions) routes.push('/api');
	routes.push('/sign-in/email', '/sign-in/token', '/sign-out');
	return routes;
}
