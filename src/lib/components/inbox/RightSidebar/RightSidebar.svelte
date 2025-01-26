<script lang="ts">
    import type { Tickets } from '$lib/types';
    import CustomerInfo from './CustomerInfo.svelte';
    import Actions from './Actions.svelte';
    import Activity from './Activity.svelte';
    import { collapsed } from '$lib/stores/collapsed';

    export let ticket: Tickets | undefined;
    
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
    <Activity {ticket} />
</aside>