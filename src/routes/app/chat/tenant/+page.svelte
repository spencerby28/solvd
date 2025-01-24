<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let messages: { role: 'user' | 'assistant'; content: string }[] = [];
	let userInput = '';
	let loading = false;
	let chatContainer: HTMLDivElement;
	let textareaHeight = 36; // Initial height
	let flashingMessageIndex = -1;

	$: teamId = $page.params.teamId;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			const form = (event.target as HTMLElement)?.closest('form');
			if (form) form.requestSubmit();
		}
	}

	function scrollToBottom() {
		setTimeout(() => {
			chatContainer?.scrollTo(0, chatContainer.scrollHeight);
		}, 100);
	}

	function adjustTextareaHeight(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		textarea.style.height = '36px'; // Reset height
		const scrollHeight = textarea.scrollHeight;
		textarea.style.height = scrollHeight + 'px';
		textareaHeight = scrollHeight;
	}
</script>

<div class="flex flex-col h-screen bg-gray-100">
	<div class="bg-white shadow-sm p-2 border-b">
		<h1 class="text-base font-semibold text-gray-800">Solvd Integrated Chat Demo</h1>
		<p class="text-xs text-gray-500">Version 0.0.1</p>
	</div>

	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 space-y-3"
	>
		{#each messages as message, i}
			<div
				class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
			>
				<div
					class="{message.role === 'user'
						? 'bg-blue-500 text-white'
						: 'bg-white text-gray-800'} rounded-lg p-2 max-w-[70%] shadow-sm text-sm {loading && i === messages.length - 1 ? 'animate-pulse' : ''}"
				>
					{message.content}
				</div>
			</div>
		{/each}
		{#if loading}
			<div class="flex justify-start">
				<div class="bg-white text-gray-800 rounded-lg p-2 shadow-sm">
					<div class="flex space-x-1.5">
						<div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
						<div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
						<div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<form
		method="POST"
		action="?/sendMessage"
		use:enhance={({ formData }) => {
			if (!userInput.trim()) return;
			loading = true;
			const newMessage = { role: 'user' as const, content: userInput.trim() };
			messages = [...messages, newMessage];
			
			// Add chat history to form data before the request
			formData.append('chatHistory', JSON.stringify(messages));
			
			scrollToBottom();

			return async ({ result }) => {
				loading = false;
				if (result.type === 'success' && typeof result.data?.message === 'string') {
					messages = [...messages, { role: 'assistant' as const, content: result.data.message }];
					userInput = '';
					scrollToBottom();
				}
			};
		}}
		class="p-4 bg-white border-t"
	>
		<div class="flex space-x-2">
			<textarea
				name="message"
				bind:value={userInput}
				on:keydown={handleKeydown}
				on:input={adjustTextareaHeight}
				placeholder="Type your message..."
				class="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[36px] max-h-[200px] overflow-y-auto"
				style="height: {textareaHeight}px;"
			>
			</textarea>
			<button
				type="submit"
				disabled={loading || !userInput.trim()}
				class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Send
			</button>
		</div>
	</form>
</div>
