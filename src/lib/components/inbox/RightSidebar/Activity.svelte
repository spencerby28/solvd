<script lang="ts">
    import { slide } from 'svelte/transition';
    import type { Tickets, Messages } from '$lib/types';
    import { collapsed } from '$lib/stores/collapsed';
    import { internalMessages } from '$lib/stores/internalMessages';

    import { onMount } from 'svelte';

    export let ticket: Tickets | undefined;
    export let messages: Messages[] = [];

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
                        <div class="relative flex gap-3">
                            {#if i < messages.length - 1}
                                <div class="absolute left-2 top-4 h-full w-0.5 bg-gray-200"></div>
                            {/if}
                            <div class="w-4 h-4 rounded-full bg-purple-500 relative z-10"></div>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-medium text-gray-900">{message.sender_name}</p>
                                <p class="text-sm text-gray-600 break-words">{message.content}</p>
                                <p class="text-xs text-gray-500">{new Date(message.$createdAt).toLocaleString()}</p>
                            </div>
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
