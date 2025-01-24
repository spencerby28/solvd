<script lang="ts">
	export let text: string | undefined;
	export let color: string = '#16a34a'; // Default to brand green
	export let textColor: string = 'white';
	export let outline: boolean = false;
	export let rounded: 'full' | 'lg' | 'md' | 'sm' = 'lg';
	export let onXClick: (() => void) | undefined = undefined;

	const roundedClasses = {
		full: 'rounded-full',
		lg: 'rounded-lg',
		md: 'rounded-md',
		sm: 'rounded'
	};
</script>

<span
	class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium {roundedClasses[rounded]} shadow-sm"
	style="
		background-color: {outline ? 'transparent' : color}; 
		color: {outline ? color : textColor}; 
		border: {outline ? `1px solid ${color}` : 'none'};
	"
>
	{text}
	{#if onXClick}
		<span
			role="button"
			tabindex="0"
			on:click|stopPropagation={onXClick}
			on:keydown={(e) => e.key === 'Enter' && onXClick()}
			class="ml-1 hover:opacity-80 cursor-pointer"
			style="color: {outline ? color : textColor};"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</span>
	{/if}
</span>
