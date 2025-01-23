<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createBrowserClient } from '$lib/appwrite-browser';
    import { initializeRealtime, tickets, messages } from '$lib/utils/realtime';
    import type { TicketDocument, MessageDocument } from '$lib/utils/realtime';
    import type { PageData } from './$types';

    export let data: PageData;
    let unsubscribe: () => void;

    onMount(async () => {
        try {
            const { client, databases, account } = createBrowserClient();
          //  const user = await account.get();
            
            // Initialize realtime with server-side data
            unsubscribe = initializeRealtime(
                client, 
                databases, 
                data.tickets as TicketDocument[],
                data.messages as MessageDocument[]
            );
        } catch (error) {
            console.error('Error initializing realtime:', error);
        }
    });
    

    
    
    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<slot />