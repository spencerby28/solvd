<script>
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="grid grid-cols-3 gap-4">
	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Analytics</span>
	</div>

	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Conversations</span>
	</div>

	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 leading-tight">Response<br>Times</span>
	</div>

	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 overflow-hidden leading-tight text-ellipsis whitespace-nowrap">Team<br/>Performance</span>
	</div>

	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Ticket Queue</span>
	</div>

	<div class="flex items-center bg-white rounded-lg shadow-lg px-4 py-3">
		<div class="p-2 rounded-lg bg-black/5 mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</div>
		<span class="font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">Settings</span>
	</div>
</div>
