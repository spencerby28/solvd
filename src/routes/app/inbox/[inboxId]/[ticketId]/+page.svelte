<script lang="ts">
    import type { PageData } from './$types';
    import { messages } from '$lib/stores/messages';
    import { page } from '$app/stores';
    import { derived } from 'svelte/store';
    import type { Messages } from '$lib/types';
    import { writable, get } from 'svelte/store';
    import { inboxActions } from '$lib/stores/inboxActions';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import { selectedTicket } from '$lib/stores/selectedTicket';
    import type { TicketStatus } from '$lib/types';
    export let data: PageData;

    const tenantId = data.user?.prefs.tenantId;
    
    // Ticket status options matching TicketListItem
    const statusOptions = [
        { value: 'NEW', label: 'New', color: 'bg-violet-100 text-violet-800 border-violet-200' },
        { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'WORKING', label: 'Working', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        { value: 'ESCALATED', label: 'Escalated', color: 'bg-red-100 text-red-800 border-red-200' },
        { value: 'SOLVD', label: 'Solvd', color: 'bg-green-100 text-green-800 border-green-200' }
    ];

    let isStatusDropdownOpen = false;
    
    // Initialize currentStatus from ticket data
    $: currentStatus = statusOptions.find(status => status.value === data.ticket?.status) || statusOptions[0];

    function toggleStatusDropdown() {
        isStatusDropdownOpen = !isStatusDropdownOpen;
    }

    function handleStatusChange(status: typeof statusOptions[0]) {
        // TODO: Implement status update functionality
        console.log('Status changed to:', status.value);
        isStatusDropdownOpen = false;
    }

    let editContent = '';

    function handleEditMessage(message: Messages) {
        if (!$inboxActions.isEditMode || (message.sender_type !== 'agent' && message.sender_type !== 'ai')) return;
        editContent = message.content;
        inboxActions.setSelectedMessage(message.$id);
        // Allow the textarea to update before adjusting height
        setTimeout(() => {
            const textarea = document.querySelector(`textarea[data-message-id="${message.$id}"]`) as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        }, 0);
    }

    function adjustTextareaHeight(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    async function handleSubmitEdit() {
        console.log('[Message Edit] Starting edit submission');
        if (!$inboxActions.selectedMessageId || !editContent.trim()) {
            console.warn('[Message Edit] Missing required fields');
            return;
        }
        
        try {
            // Immediately update local state
            const messageToUpdate = $messages[$page.params.ticketId]?.find(m => m.$id === $inboxActions.selectedMessageId);
            if (messageToUpdate) {
                const updatedMessage = { ...messageToUpdate, content: editContent };
                messages.upsert(updatedMessage);
            }

            console.log('[Message Edit] Sending edit request', {
                messageId: $inboxActions.selectedMessageId,
                content: editContent
            });

            const response = await fetch(`/api/web/message/${tenantId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messageId: $inboxActions.selectedMessageId,
                    content: editContent
                })
            });

            if (!response.ok) {
                console.error('[Message Edit] Server returned error response:', response.status);
                throw new Error('Failed to update message');
            }

            const updatedMessage = await response.json();
            console.log('[Message Edit] Successfully updated message:', updatedMessage);
            messages.upsert(updatedMessage);
            
            // Reset edit state
            console.log('[Message Edit] Resetting edit state');
            editContent = '';
            inboxActions.setSelectedMessage(null);
            inboxActions.toggleEditMode();

        } catch (error) {
            console.error('[Message Edit] Error updating message:', error);
        }
    }

    // Initialize messages store with server data
    $: {
        data.messages.forEach(message => {
            messages.upsert(message as Messages);
        });
    }
    $: {
  //      console.log('Customer:', data.customer);
    }

    // Derive messages for current ticket from the store
    const ticketMessages = derived([messages, page], ([$messages, $page]) => {
        const ticketId = $page.params.ticketId;
        return $messages[ticketId] || [];
    });
</script>

<style>
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
        scrollbar-color: transparent transparent;
    }
    .hide-scrollbar::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        background: transparent;
        display: none;
    }
    .hide-scrollbar::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .hide-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
</style>

<div class="h-full w-full flex flex-col hide-scrollbar">
    <div class="sticky top-0 bg-white shadow-sm p-4 z-10">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">Ticket Details</h2>
            <div class="flex items-center gap-4">
                {#if $inboxActions.isEditMode}
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md border border-green-200">
                        Edit Mode
                    </span>
                {/if}
                
                <div class="relative">
                    <!-- Status Badge/Button -->
                    <button
                        on:click={toggleStatusDropdown}
                        class="flex items-center gap-2 px-3 py-1.5 rounded-md {currentStatus.color} border text-sm font-medium"
                    >
                        {currentStatus.label}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <!-- Status Dropdown -->
                    {#if isStatusDropdownOpen}
                        <div class="absolute right-0 my-2  w-fit min-w-[100px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                            <div class="py-1 px-2 space-y-2 flex flex-col " role="menu">
                                {#each statusOptions as status}
                                    <button
                                        on:click={() => handleStatusChange(status)}
                                        class="w-full text-left px-3 py-1 text-sm rounded-md {status.color} hover:opacity-80 transition-opacity"
                                    >
                                        {status.label}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>


            </div>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
        {#if $ticketMessages.length > 0}
            {#each $ticketMessages as message}
                <div class="flex {message.sender_type === 'customer' ? 'justify-start' : 'justify-end'}">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div class="flex items-start max-w-[400px] min-w-0 {message.sender_type === 'customer' ? 'flex-row' : 'flex-row-reverse'}"
                        class:cursor-pointer={$inboxActions.isEditMode && (message.sender_type === 'agent' || message.sender_type === 'ai')}
                        on:click={() => handleEditMessage(message)}
                    >
                        <div class="min-w-0 max-w-full">
                            <div class="flex items-center space-x-2 mb-1 {message.sender_type === 'customer' ? '' : 'flex-row-reverse space-x-reverse'}">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    {#if message.sender_type === 'customer'}
                                        <span class="text-gray-600 font-medium text-sm">C</span>
                                    {:else}
                                        <span class="text-blue-600 font-medium text-sm">A</span>
                                    {/if}
                                </div>
                                <span class="text-sm font-medium text-gray-900 truncate max-w-[150px]">{message.sender_name}</span>
                            </div>
                            <div class="rounded-2xl px-4 py-2.5 {message.sender_type === 'customer' ? 'bg-blue-100 text-gray-900' : 'bg-green-100 text-gray-800'} break-words shadow-lg ml-10">
                                {#if $inboxActions.selectedMessageId === message.$id}
                                    <textarea
                                        bind:value={editContent}
                                        data-message-id={message.$id}
                                        class="max-w-[400px] min-w-[325px] bg-transparent text-sm whitespace-pre-wrap break-words focus:ring-2 focus:ring-green-600 focus:outline-none border-none p-0 m-0 resize-none rounded-sm"
                                        on:input={adjustTextareaHeight}
                                    >{message.content}</textarea>
                                {:else}
                                    <p class="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                {/if}
                            </div>
                            <div class="mt-1 flex items-center gap-2 {message.sender_type === 'customer' ? 'ml-10' : 'flex-row-reverse'}">
                                <span class="text-xs text-gray-500">{new Date(message.$createdAt).toLocaleString()}</span>
                                {#if $inboxActions.selectedMessageId === message.$id && $inboxActions.isEditMode}
                                    <div on:click={handleSubmitEdit}>
                                        <RippleButton
                                            class="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md"
                                            rippleColor="#16a34a"
                                            duration="500ms"
                                        >
                                            Submit
                                        </RippleButton>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="flex items-center justify-center h-full">
                <p class="text-gray-500">No messages in this ticket</p>
            </div>
        {/if}
    </div>
</div>
