<script lang="ts">
	import { Button, TextInput } from 'carbon-components-svelte';
	import { Send } from 'carbon-icons-svelte';

	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
</script>

<form class="bx--form" on:submit method="POST" use:enhance>
	<h1>Sign In</h1>

	<div class="my-4">
		<TextInput
			labelText="Email"
			helperText="Your email is required for authentication purposes"
			placeholder="Enter email..."
			type="email"
			name="email"
			required
			invalid={$page.status === 400 || $page.status === 401}
			invalidText="Please enter a valid email address"
		/>
	</div>

	<Button type="submit" icon={Send}>Send verification code</Button>
</form>
