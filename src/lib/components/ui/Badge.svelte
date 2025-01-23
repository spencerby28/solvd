<script lang="ts">
	export let text: string;
	export let color: string = '#16a34a'; // Default to brand green
	export let textColor: string = 'white';
	export let outline: boolean = false;
	export let rounded: 'full' | 'lg' | 'md' | 'sm' = 'lg';

	const roundedClasses = {
		full: 'rounded-full',
		lg: 'rounded-lg',
		md: 'rounded-md',
		sm: 'rounded'
	};
</script>

<div
	class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium {roundedClasses[rounded]} shadow-sm"
	style="
		background-color: {outline ? 'transparent' : color}; 
		color: {outline ? color : textColor}; 
		border: {outline ? `1px solid ${color}` : 'none'};
	"
>
	{text}
</div>
