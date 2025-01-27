<script lang="ts">
    import { slide } from 'svelte/transition';
    import type { Tickets, Messages } from '$lib/types';
    import { collapsed } from '$lib/stores/collapsed';
    import { internalMessages } from '$lib/stores/internalMessages';
    import { deleteMessage } from '$lib/db/message';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    export let ticket: Tickets | undefined;
    export let messages: Messages[] = [];

    async function handleDeleteMessage(messageId: string) {
        if (!ticket) return;
        try {
            await deleteMessage(ticket.tenant_id || '', messageId, ticket.$id);
            messages = messages.filter(m => m.$id !== messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }
</script>

<style>
    /* Add a minimal height constraint to prevent initial jolt */
    :global(.slide-transition) {
        min-height: 0;
        height: auto !important;
    }
</style>

{#if !$collapsed}
    <!-- Activity Timeline -->
    <div class="px-4 border-t border-gray-200 flex-1 flex flex-col min-h-0 slide-transition" transition:slide|local>
        <p class="text-xs text-gray-500 my-3">RECENT ACTIVITY</p>
        <div class="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div class="space-y-4 pb-4">
                {#if messages.length}
                    {#each messages as message, i}
                        <div class="relative flex gap-3 group">
                            {#if i < messages.length - 1}
                                <div class="absolute left-2 top-4 h-full w-0.5 bg-gray-200"></div>
                            {/if}
                            <div class="w-4 h-4 rounded-full bg-purple-500 relative z-10"></div>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-medium text-gray-900">{message.sender_name}</p>
                                <p class="text-sm text-gray-600 break-words">{message.content}</p>
                                <p class="text-xs text-gray-500">{new Date(message.$createdAt).toLocaleString()}</p>
                            </div>
                            {#if message.sender_id === $page.data.user.$id}
                                <button 
                                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded"
                                    on:click={() => handleDeleteMessage(message.$id)}
                                    title="Delete message"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            {/if}
                        </div>
                    {/each}
                {/if}
                <div class="relative flex gap-3">
                    <div class="w-4 h-4 rounded-full bg-blue-500 relative z-10"></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">Ticket Created</p>
                        {#if ticket?.$createdAt}
                            <p class="text-xs text-gray-500">{new Date(ticket.$createdAt).toLocaleString()}</p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
