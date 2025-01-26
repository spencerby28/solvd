<script lang="ts">
    import { slide } from 'svelte/transition';
    import type { Tickets } from '$lib/types';
    import { collapsed } from '$lib/stores/collapsed';

    export let ticket: Tickets | undefined;

    // Mock internal messages - keeping these as requested
    const mockInternalMessages = [
        {
            id: 'int_6',
            content: 'Fix successfully deployed to production',
            author: 'Sarah Chen',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
            type: 'internal'
        },
        {
            id: 'int_5',
            content: 'QA testing completed on staging, preparing production deployment',
            author: 'David Park',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
            type: 'internal'
        },
        {
            id: 'int_4',
            content: 'Hotfix deployed to staging environment',
            author: 'Jennifer Wu',
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
            type: 'internal'
        },
        {
            id: 'int_3',
            content: 'Engineering confirmed bug in latest release',
            author: 'Mike Johnson', 
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
            type: 'internal'
        },
        {
            id: 'int_2', 
            content: 'Escalated to engineering team for review',
            author: 'Sarah Chen',
            timestamp: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
            type: 'internal'
        },
        {
            id: 'int_1',
            content: 'Customer reported integration issues with API v2',
            author: 'Spencer Byrne',
            timestamp: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
            type: 'internal'
        }
    ];
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
                {#each mockInternalMessages as message, i}
                    <div class="relative flex gap-3">
                        {#if i < mockInternalMessages.length}
                            <div class="absolute left-2 top-4 h-full w-0.5 bg-gray-200"></div>
                        {/if}
                        <div class="w-4 h-4 rounded-full bg-purple-500 relative z-10"></div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900">{message.author}</p>
                            <p class="text-sm text-gray-600 break-words">{message.content}</p>
                            <p class="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                {/each}
                <div class="relative flex gap-3">
                    <div class="w-4 h-4 rounded-full bg-blue-500 relative z-10"></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">Ticket Created</p>
                        {#if ticket?.$createdAt}
                            <p class="text-xs text-gray-500">{new Date(ticket.$createdAt).toLocaleDateString()}</p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
