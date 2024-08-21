<script lang="ts">
	import { Button, TextInput } from 'carbon-components-svelte';
	import { Send } from 'carbon-icons-svelte';

	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	import { tokenLength } from '../constants';
</script>

<form class="bx--form" on:submit method="POST" use:enhance>
	<h1>Sign In</h1>

	<div class="my-4">
		<TextInput
			labelText="Verification token"
			helperText="Check your email inbox for a {tokenLength} characters token"
			placeholder="Enter token..."
			type="password"
			name="token"
			required
			invalid={$page.status === 400 || $page.status === 401}
			invalidText="Please enter the correct token"
		/>
		<input hidden name="email" value={$page.url.searchParams.get('email')} />
	</div>

	<Button type="submit" icon={Send}>Sign in</Button>
</form>
