<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createBrowserClient } from '$lib/appwrite-browser';
    import { chatSession } from '$lib/stores/chat';
    import { browser } from '$app/environment';
    export let data: { tenantId: string; ticketId: string };

    let unsubscribe: () => void;
    let intervalId: NodeJS.Timeout;

    const updateLastSeen = async () => {
        // Only run on client side
        if (!browser) return;
        
        try {
            await fetch(`/api/ticket/${data.tenantId}/${data.ticketId}/last-seen`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Failed to update last seen:', error);
        }
    };

    onMount(async () => {
        const session = await fetch('/api/web/session').then(res => res.json());
        if (session.session) {
            const cookieFallback = JSON.stringify({
                [`a_session_solvd`]: session.session
            });
            localStorage.setItem('cookieFallback', cookieFallback);
        }

        const { client, databases } = createBrowserClient();
        
        try {
            // Initialize realtime connection and set initial messages
            unsubscribe = chatSession.initialize(client, databases);
        } catch (err) {
            console.error('[ChatPage] Error initializing chat:', err);
        }

        // Update immediately on mount
        updateLastSeen();
        // Then set up the interval
        intervalId = setInterval(updateLastSeen, 5000);
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
        clearInterval(intervalId);
        // Make one final update when the component is destroyed
        updateLastSeen();
    });
</script>

<slot />