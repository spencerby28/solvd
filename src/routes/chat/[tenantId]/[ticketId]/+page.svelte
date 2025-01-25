<script lang="ts">
    import { chatSession } from '$lib/stores/chat';
    import { onMount } from 'svelte';
    import { MessageSquare } from 'lucide-svelte';
    import { page } from '$app/stores';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import * as Drawer from "$lib/components/ui/drawer";

    export let data;
    const tenantId = $page.params.tenantId;
    const ticketId = $page.params.ticketId;
    const messages = data.messages;

    let messageContent = '';
    let messagesContainer: HTMLDivElement;
    let drawerOpen = false;

    onMount(() => {
        // @ts-ignore
        chatSession.set(messages);
		console.log('messages', messages);
    });

    async function handleSubmit() {
        if (!messageContent.trim()) return;

        try {
            const response = await fetch(`/api/chat/${tenantId}/message/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageContent,
					name: $chatSession[1]?.sender_name,
                    ticketId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageContent = '';
        } catch (err) {
            console.error('Error sending message:', err);
        }
    }

	let name = '';
	async function addName() {
		console.log('name', name);
		const response = await fetch(`/api/chat/${tenantId}/user`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ticketId, name })
		});
		if (response.ok) {
			// Update the chatSession store with the new name, preserving message[0]
			const updatedMessages = $chatSession.map((msg, index) => {
				// Skip index 0 to preserve first message
				if (index > 0) {
					return { ...msg, sender_name: name };
				}
				return msg;
			});
			chatSession.set(updatedMessages);
		}

		drawerOpen = false;
	}
	//TODO: add BACK TO MENU button and update page to have the list of tickets that this user has access to

	//TODO: ADD SCROLL TO BOTTOM 


	async function createTicket() {
		const response = await fetch(`/api/web/tickets/chat`, {
			method: 'POST',
			body: JSON.stringify({ ticketId, customerId: data.userId, name: $chatSession[1]?.sender_name, tenantId })
		});
	}
</script>

<style>
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        background: transparent;
        display: none;
    }
</style>

<div class="flex flex-col h-screen">
    <header class="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
				
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <h1 class="text-xl font-semibold flex items-center gap-2 text-gray-800 cursor-pointer" on:click={createTicket}>
                    <MessageSquare class="h-6 w-6 text-green-600" />
                    <span class="font-bold text-2xl">Support Chat</span>
                </h1>
                {#if $chatSession[1]?.sender_name === 'Anonymous'}
                    <Drawer.Root bind:open={drawerOpen}>
                        <Drawer.Trigger let:builder>
                            <RippleButton 
                                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                                rippleColor="#16a34a"
                                duration="500ms"
                            >
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                    </svg>
                                    Set Name
                                </div>
                            </RippleButton>
                        </Drawer.Trigger>
                        <Drawer.Content>
                            <Drawer.Header>
                                <Drawer.Title>Set Name</Drawer.Title>
                                <Drawer.Description>What's a good name?</Drawer.Description>
                            </Drawer.Header>
                            <div class="p-4">
                                <input
                                    bind:value={name}
                                    type="text"
                                    placeholder="Enter name..."
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm outline-none"
                                />
                            </div>
                            <Drawer.Footer>
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div on:click={addName} class="w-full">
                                    <RippleButton 
                                        class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium w-full"
                                        rippleColor="#166534"
                                        duration="1000ms"
                                    >
                                        Submit
                                    </RippleButton>
                                </div>
                                <Drawer.Close class="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                                    Cancel
                                </Drawer.Close>
                            </Drawer.Footer>
                        </Drawer.Content>
                    </Drawer.Root>
                {:else if $chatSession[1]?.sender_name}
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">

                        <div>
                            <p class="text-green-800 font-medium">Welcome, {$chatSession[1].sender_name}!</p>
                    
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </header>

    <div class="flex-1 overflow-y-auto hide-scrollbar bg-gray-50">
        <div class="max-w-5xl mx-auto px-4 py-8">
            {#if $chatSession.length > 0}
                <div class="space-y-4" bind:this={messagesContainer}>
                    {#each $chatSession as message}
                        <div class="flex flex-col {message.sender_type === 'customer' ? 'items-end' : 'items-start'}">
                            <span class="text-sm text-gray-500 mb-1 px-2">
                                {message.sender_name} • {new Date(message.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div class="max-w-[80%] {message.sender_type === 'customer' ? 'bg-green-600 text-white' : 'bg-white'} rounded-2xl shadow-md p-4">
                                <p class="{message.sender_type === 'customer' ? 'text-white' : 'text-gray-700'} break-words">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="space-y-4">
                    {#each Array(3) as _}
                        <div class="bg-white rounded-2xl shadow-md p-4 animate-pulse w-full">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
	<!-- TODO: add actual func but also ability to hide/show -->
    <div class="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <div class="max-w-5xl mx-auto">
            <div class="absolute bottom-20 left-4 flex gap-2">
                <RippleButton
                    class="px-4 py-2 bg-gray-100/90 backdrop-blur-sm hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg"
                    rippleColor="#374151"
                    duration="1000ms"
                >
                    <div class="flex items-center gap-2">
                        <span class="text-lg">Aa</span>
                        Set Language
                    </div>
                </RippleButton>

                <RippleButton
                    class="px-4 py-2 bg-gray-100/90 backdrop-blur-sm hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg"
                    rippleColor="#374151"
                    duration="1000ms"
                >
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                        </svg>
                        Add File
                    </div>
                </RippleButton>
            </div>

            <div class="flex gap-2">
                <input
                    type="text"
                    bind:value={messageContent}
                    placeholder="Type your message..."
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm min-h-[40px] outline-none transition-shadow duration-200"
                    on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                />
                <RippleButton 
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={handleSubmit}
                    disabled={!messageContent.trim()}
                    rippleColor="#166534"
                    duration="1000ms"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </RippleButton>
            </div>
        </div>
    </div>
</div>
