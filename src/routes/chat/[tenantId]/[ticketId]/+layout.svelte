<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createBrowserClient } from '$lib/appwrite-browser';
    import { chatSession } from '$lib/stores/chat';

    let unsubscribe: () => void;

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
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>
<slot />