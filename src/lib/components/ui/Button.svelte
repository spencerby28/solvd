<script lang="ts">
	export let type: 'button' | 'submit' = 'button';
	export let variant: 'primary' | 'secondary' = 'primary';
	export let disabled = false;
</script>

<button
	{type}
	{disabled}
	class="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors
    {variant === 'primary'
		? 'bg-blue-600 text-white hover:bg-blue-700'
		: 'bg-gray-200 text-gray-700 hover:bg-gray-300'} 
    disabled:opacity-50 disabled:cursor-not-allowed"
	on:click
>
	<slot />
</button> 