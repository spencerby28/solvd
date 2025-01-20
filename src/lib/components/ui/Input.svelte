<script lang="ts">
	export let type: 'text' | 'email' | 'password' = 'text';
	export let name: string;
	export let label: string;
	export let value = '';
	export let required = false;
	export let error: string | undefined = undefined;
	export let disabled = false;
</script>

<div class="space-y-2">
	<label for={name} class="block text-sm font-medium text-gray-700">{label}</label>
	<input
		{type}
		{name}
		{required}
		{disabled}
		bind:value
		id={name}
		class="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        {error ? 'border-red-500' : 'border-gray-300'}
		{disabled ? 'bg-gray-100 cursor-not-allowed' : ''}"
	/>
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div> 