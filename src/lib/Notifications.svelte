<script context="module" lang="ts">
	import type { ToastNotificationProps } from 'carbon-components-svelte/src/Notification/ToastNotification.svelte';
	import ToastNotification from 'carbon-components-svelte/src/Notification/ToastNotification.svelte';
	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { uid } from 'uid';

	export type Notification = Pick<
		ToastNotificationProps,
		'title' | 'subtitle' | 'caption' | 'kind' | 'timeout'
	> & { id: string };

	const { subscribe, update } = writable<Notification[]>([]);

	export const notifications = {
		subscribe,
		add: (notification: Omit<Notification, 'id'>) =>
			update((notifications) => [...notifications, { ...notification, id: uid() }]),
		remove: (id: string) =>
			update((notifications) => notifications.filter((notification) => notification.id !== id)),
	};
</script>

<div class="absolute z-10 bottom-2 right-0">
	{#each $notifications as { id, title, subtitle, caption, kind, timeout } (id)}
		<div transition:slide class="py-[1px]">
			<ToastNotification
				{title}
				{subtitle}
				{caption}
				{kind}
				{timeout}
				on:close={(e) => {
					e.preventDefault();
					notifications.remove(id);
				}}
			/>
		</div>
	{/each}
</div>
