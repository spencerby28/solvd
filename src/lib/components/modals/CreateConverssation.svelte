<script lang="ts">
    import { createSessionClient } from '$lib/appwrite';
    import { ID } from 'appwrite';
    import * as Dialog from '$lib/components/ui/dialog';
    import { onMount } from 'svelte';

    export let open = false;
    export let onOpenChange: (open: boolean) => void;
    
    let title = '';
    let message = '';
    let loading = false;

const handleSubmit = async () => {
    console.log('Creating conversation...');
};
</script>

<Dialog.Root bind:open onOpenChange={onOpenChange}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title class="text-2xl font-extrabold text-green-600">New Conversation</Dialog.Title>
            <Dialog.Description>
                Create a new conversation to start chatting
            </Dialog.Description>
        </Dialog.Header>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="space-y-2">
                <label for="title" class="text-sm font-medium">Title</label>
                <input 
                    id="title"
                    bind:value={title}
                    placeholder="Enter conversation title"
                    class="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <div class="space-y-2">
                <label for="message" class="text-sm font-medium">Message</label>
                <textarea
                    id="message"
                    bind:value={message}
                    placeholder="Type your message here"
                    rows="4"
                    class="w-full px-3 py-2 border rounded-md"
                    required
                />
            </div>

            <Dialog.Footer>
                <Dialog.Close class="px-4 py-2 border rounded-md">
                    Cancel
                </Dialog.Close>
                <button 
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Conversation'}
                </button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>

