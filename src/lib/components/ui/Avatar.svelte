<script lang="ts">
    import { createBrowserClient } from '$lib/appwrite-browser';
    import { onMount } from 'svelte';

    export let user: any;
    export let size: 'sm' | 'md' | 'lg' = 'md';

    let avatarUrl: string | null = null;

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12', 
        lg: 'w-20 h-20'
    };

    async function getAvatarUrl() {
        const {storage} = createBrowserClient();
        if (user?.prefs?.avatarId) {
            try {
                const result = await storage.getFilePreview('avatars', user.prefs.avatarId);
                avatarUrl = result.href;
            } catch (error) {
                console.error('Error fetching avatar:', error);
                avatarUrl = null;
            }
        }
    }

    onMount(() => {
        getAvatarUrl();
    });

    $: fallbackUrl = `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=16a34a&color=fff`;
</script>

<div class="{sizeClasses[size]} rounded-3xl overflow-hidden bg-gray-100">
    {#if avatarUrl}
        <img
            src={avatarUrl}
            alt={user?.name || 'User avatar'}
            class="w-full h-full object-cover"
        />
    {:else}
        <img
            src={fallbackUrl}
            alt={user?.name || 'User avatar'}
            class="w-full h-full object-cover"
        />
    {/if}
</div>
