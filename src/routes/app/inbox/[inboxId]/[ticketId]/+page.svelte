<script lang="ts">
    import type { PageData } from './$types';
    import { messages } from '$lib/stores/messages';
    import { page } from '$app/stores';
    import { derived } from 'svelte/store';
    import type { Messages } from '$lib/types';
    export let data: PageData;

    // Initialize messages store with server data
    $: {
        data.messages.forEach(message => {
            messages.upsert(message as Messages);
        });
    }
    $: {
  //      console.log('Customer:', data.customer);
    }

    // Derive messages for current ticket from the store
    const ticketMessages = derived([messages, page], ([$messages, $page]) => {
        const ticketId = $page.params.ticketId;
        return $messages[ticketId] || [];
    });
</script>

<style>
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
        scrollbar-color: transparent transparent;
    }
    .hide-scrollbar::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        background: transparent;
        display: none;
    }
    .hide-scrollbar::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .hide-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
</style>

<div class="h-full w-full flex flex-col hide-scrollbar">
    <div class="sticky top-0 bg-white shadow-sm p-4 z-1">
        <h2 class="text-lg font-medium text-gray-900">Ticket Details</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
        {#if $ticketMessages.length > 0}
            {#each $ticketMessages as message}
                <div class="flex {message.sender_type === 'customer' ? 'justify-start' : 'justify-end'}">
                    <div class="flex items-start max-w-[400px] min-w-0 {message.sender_type === 'customer' ? 'flex-row' : 'flex-row-reverse'}">
                        <div class="min-w-0 max-w-full">
                            <div class="flex items-center space-x-2 mb-1 {message.sender_type === 'customer' ? '' : 'flex-row-reverse space-x-reverse'}">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    {#if message.sender_type === 'customer'}
                                        <span class="text-gray-600 font-medium text-sm">C</span>
                                    {:else}
                                        <span class="text-blue-600 font-medium text-sm">A</span>
                                    {/if}
                                </div>
                                <span class="text-sm font-medium text-gray-900 truncate max-w-[150px]">{message.sender_name}</span>
                            </div>
                            <div class="rounded-2xl px-4 py-2.5 {message.sender_type === 'customer' ? 'bg-blue-100 text-gray-900' : 'bg-green-100 text-gray-800'} break-words shadow-lg ml-10">
                                <p class="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <div class="mt-1 {message.sender_type === 'customer' ? 'text-left ml-10' : 'text-right'}">
                                <span class="text-xs text-gray-500">{new Date(message.$createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="flex items-center justify-center h-full">
                <p class="text-gray-500">No messages in this ticket</p>
            </div>
        {/if}
    </div>
</div>
