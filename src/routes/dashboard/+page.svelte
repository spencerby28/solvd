<!-- dashboard/+page.svelte -->
<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
				</div>
				<div class="flex items-center">
					<form method="POST">
						<Button variant="secondary" type="submit">Sign out</Button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
				<p class="text-gray-500">Welcome to your dashboard!</p>
			</div>
		</div>
	</main>
</div>