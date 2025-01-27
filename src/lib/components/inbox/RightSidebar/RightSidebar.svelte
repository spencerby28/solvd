<script lang="ts">
    import type { Tickets } from '$lib/types';
    import CustomerInfo from './CustomerInfo.svelte';
    import Actions from './Actions.svelte';
    import Activity from './Activity.svelte';
    import { collapsed } from '$lib/stores/collapsed';
    import { internalMessages } from '$lib/stores/internalMessages';
    import { derived } from 'svelte/store';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';


    export let ticket: Tickets | undefined;

    const sortedInternalMessages = derived([internalMessages, selectedTicket], ([$internalMessages, $selectedTicket]) => {
        if (!$selectedTicket) return [];
        return [...$internalMessages]
            .filter(msg => msg.ticket_id === $selectedTicket.$id)
            .sort((a, b) => {
                return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
            });
    });
    
</script>

<style>
    /* Add smooth transitions for width changes */
    aside {
        will-change: width;
    }
</style>

<aside class="bg-gray-100 border-x border-gray-200 shadow-lg relative rounded-l-3xl flex flex-col h-screen overflow-hidden transition-all duration-300 {$collapsed ? 'w-16' : 'w-80'}">
    <CustomerInfo {ticket}  />
    <Actions {ticket}  />
    <Activity {ticket} messages={$sortedInternalMessages} />
</aside>