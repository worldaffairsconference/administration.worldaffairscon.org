<script lang="ts">
	import '../app.pcss';
	import 'chartjs-adapter-moment';

	import {
		Content,
		Header,
		HeaderAction,
		HeaderNav,
		HeaderNavItem,
		HeaderPanelDivider,
		HeaderPanelLink,
		HeaderUtilities,
		SideNav,
		SideNavItems,
		SideNavLink,
		SkipToContent,
	} from 'carbon-components-svelte';
	import {
		type CarbonIcon,
		Education,
		Events,
		EventSchedule,
		Help,
		Home,
		UserAvatarFilled,
		UserAvatarFilledAlt,
		Locked,
	} from 'carbon-icons-svelte';

	import { page } from '$app/stores';
	import Notifications from '$lib/Notifications.svelte';

	import type { PageData } from './$types';

	interface Route {
		name: string;
		path: string;
		icon: typeof CarbonIcon;
	}

	export let data: PageData;
	$: user = data.user;
	$: permissions = user?.permissions;

	$: routes = [
		permissions?.canViewSummaryStatistics && {
			name: 'Homepage',
			path: '/',
			icon: Home,
		},
		permissions?.canViewAttendees && {
			name: 'Attendees',
			path: '/attendees',
			icon: Events,
		},
		permissions?.canViewSchools && {
			name: 'Partner Schools',
			path: '/partner-schools',
			icon: Education,
		},
		permissions?.canViewPlenaries && {
			name: 'Plenaries',
			path: '/plenaries',
			icon: EventSchedule,
		},
		permissions?.canViewFrequentlyAskedQuestions && {
			name: 'Frequently Asked Questions',
			path: '/frequently-asked-questions',
			icon: Help,
		},
		permissions?.canViewPlenaryAssignments && {
			name: 'Plenary Assignments',
			path: '/plenary-assignments',
			icon: Help,
		},
		permissions?.canEditPermissions && {
			name: 'Permissions',
			path: '/permissions',
			icon: Locked,
		},
	].filter((r: Route | false | undefined): r is Route => !!r);

	let isSideNavOpen = false;
</script>

<svelte:head>
	<title>WAC Administration Dashboard</title>
</svelte:head>

<Header company="WAC" platformName="Administration Dashboard" bind:isSideNavOpen>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	{#if user}
		<HeaderNav>
			{#each routes as route}
				<HeaderNavItem
					text={route.name}
					href={route.path}
					isSelected={$page.url.pathname === route.path}
				/>
			{/each}
		</HeaderNav>
		<HeaderUtilities>
			<HeaderAction icon={UserAvatarFilledAlt}>
				<HeaderPanelDivider>Hi {user.firstName} {user.lastName}</HeaderPanelDivider>
				<HeaderPanelLink>Settings</HeaderPanelLink>
				<HeaderPanelLink href="/sign-out">Sign Out</HeaderPanelLink>
			</HeaderAction>
		</HeaderUtilities>
	{:else}
		<HeaderUtilities>
			<HeaderAction icon={UserAvatarFilled}>
				<HeaderPanelLink href="/sign-in/email">Sign In</HeaderPanelLink>
			</HeaderAction>
		</HeaderUtilities>
	{/if}
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
	{#if user}
		<SideNavItems>
			{#each routes as route}
				<SideNavLink
					icon={route.icon}
					text={route.name}
					href={route.path}
					isSelected={$page.url.pathname === route.path}
				/>
			{/each}
		</SideNavItems>
	{/if}
</SideNav>

<Content>
	<Notifications />
	<slot />
</Content>
