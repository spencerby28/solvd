<script lang="ts">
    import type { PageData } from './$types';
    import { messages } from '$lib/stores/messages';
    import { page } from '$app/stores';
    import { derived } from 'svelte/store';
    import type { Messages } from '$lib/types';
    import { writable, get } from 'svelte/store';
    import { inboxActions } from '$lib/stores/inboxActions';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';
    import type { TicketStatus } from '$lib/types';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Edit, ChevronDown, FileText, Image, Film, FileArchive, Trash2 } from 'lucide-svelte';
    import { internalMessages } from '$lib/stores/internalMessages';
    import {createBrowserClient} from '$lib/appwrite-browser';
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { onDestroy } from 'svelte';



    export let data: PageData;

    const tenantId = data.user?.prefs.tenantId;
    const userName = data.user?.name;
    const userId = data.user?.$id;
    internalMessages.set(data.internalMessages as Messages[]);
    $: console.log('internalMessages', data.internalMessages);
    
    // Ticket status options matching TicketListItem
    const statusOptions = [
        { value: 'NEW', label: 'New', color: 'bg-violet-100 text-violet-800 border-violet-200' },
        { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'WORKING', label: 'Working', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        { value: 'ESCALATED', label: 'Escalated', color: 'bg-red-100 text-red-800 border-red-200' },
        { value: 'SOLVD', label: 'Solvd', color: 'bg-green-100 text-green-800 border-green-200' }
    ];

    let isStatusDropdownOpen = false;
    // Initialize currentStatus from selectedTicket store
    $: currentStatus = statusOptions.find(status => status.value === $selectedTicket?.status) || statusOptions[0];
    $: console.log('currentStatus', currentStatus);
    async function handleStatusChange(status: typeof statusOptions[0]) {
        
        try {
            await fetch(`/api/web/tickets/update?status=${status.value}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ticketId: $selectedTicket?.$id,
                    userName: userName,
                    userId: userId
                })
            });
            
            // Update currentStatus after successful API call
            currentStatus = status;

        } catch (error) {
            console.error('Failed to update ticket status:', error);
        }
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
        const ticketMessages = $messages[ticketId] || [];
        return [...ticketMessages].sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
    });

    type FileData = {
        $id: string;
        name: string;
        mimeType: string;
        sizeOriginal: number;
        previewUrl?: string;
    };

    const fileCache = new Map<string, FileData>();

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async function getFileData(tenantId: string, fileId: string): Promise<FileData> {
        if (fileCache.has(fileId)) {
            return fileCache.get(fileId)!;
        }

        const { storage } = createBrowserClient();
        try {
            const fileData = await storage.getFile(tenantId, fileId);
            const data: FileData = {
                $id: fileData.$id,
                name: fileData.name,
                mimeType: fileData.mimeType,
                sizeOriginal: fileData.sizeOriginal,
            };
            
            // For videos, use view URL instead of download URL
            if (fileData.mimeType.startsWith('video/')) {
                data.previewUrl = storage.getFileView(tenantId, fileId);
            } else if (fileData.mimeType.startsWith('image/')) {
                data.previewUrl = storage.getFilePreview(tenantId, fileId);
            } else {
                data.previewUrl = storage.getFileDownload(tenantId, fileId);
            }
            
            fileCache.set(fileId, data);
            return data;
        } catch (error) {
            console.error('Error fetching file data:', error);
            throw error;
        }
    }

    // Add these variables to manage the delete dialog state
    let messageToDelete: Messages | null = null;
    
    async function handleDeleteMessage(message: Messages) {
        try {
            const response = await fetch(`/api/web/message/${tenantId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messageId: message.$id,
                    ticketId: $page.params.ticketId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            // Remove message from local store
            messages.remove(message);
            // Reset the messageToDelete
            messageToDelete = null;

        } catch (error) {
            console.error('Error deleting message:', error);
            // You might want to show an error notification here
        }
    }

    let activeVideoId: string | null = null;

    // When navigating away or unmounting, reset activeVideoId
    onDestroy(() => {
        activeVideoId = null;
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
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <button class="flex items-center gap-2 px-3 py-1.5 rounded-md {currentStatus.color} border text-sm font-medium">
                                {currentStatus.label}
                                <ChevronDown class="w-4 h-4" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content class="w-[140px]">
                            
                            
                            {#each statusOptions as status}
                                <DropdownMenu.Item
                                    on:click={() => handleStatusChange(status)}
                                    class="{status.color} px-3 py-2.5 my-1 mx-1 rounded-md text-sm"
                                >
                                    {#if status.label === currentStatus.label}
                                        <span class="font-bold">{status.label}</span>
                                    {:else}
                                        {status.label}
                                    {/if}
                                </DropdownMenu.Item>
                            {/each}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>

            </div>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
        {#if $ticketMessages.length > 0}
            {#each $ticketMessages as message}
                <div class="flex {message.sender_type === 'customer' ? 'justify-start' : 'justify-end'}">
                    <ContextMenu.Root>
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <ContextMenu.Trigger>

                            <!-- svelte-ignore a11y_click_events_have_key_events -->
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
                                        {#if message.attachments && message.attachments.length > 0}
                                            <div class="mb-2 space-y-2">
                                                {#each message.attachments as fileId}
                                                    {#await getFileData(tenantId || '', fileId)}
                                                        <div class="rounded-lg bg-gray-100 p-2 animate-pulse">
                                                            <div class="h-8 w-full bg-gray-200 rounded"></div>
                                                        </div>
                                                    {:then fileData}
                                                        {#if fileData.mimeType.startsWith('video/')}
                                                            <div class="rounded-lg overflow-hidden bg-gray-100">
                                                                <div class="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                                                    <div class="flex items-center gap-2">
                                                                        <Film class="h-5 w-5 text-blue-500" />
                                                                        <div class="text-sm">
                                                                            <div class="font-medium truncate max-w-[200px]">{fileData.name}</div>
                                                                            <div class="text-xs text-gray-500">
                                                                                {formatFileSize(fileData.sizeOriginal)} • {fileData.mimeType.split('/')[1].toUpperCase()}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {#if activeVideoId === fileData.$id}
                                                                    <video 
                                                                        controls
                                                                        preload="metadata"
                                                                        class="max-w-full h-auto w-full"
                                                                    >
                                                                        <source src={fileData.previewUrl} type={fileData.mimeType}>
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                {:else}
                                                                    <button 
                                                                        class="w-full relative group"
                                                                        on:click={() => activeVideoId = fileData.$id}
                                                                    >
                                                                        <div class="aspect-video bg-gray-100 flex flex-col items-center justify-center gap-3">
                                                                            <div class="w-16 h-16 rounded-full bg-green-600/90 flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-lg">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
                                                                                </svg>
                                                                            </div>
                                                                            <span class="text-xs uppercase tracking-wide text-gray-500">Click to play video</span>
                                                                        </div>
                                                                    </button>
                                                                {/if}
                                                            </div>
                                                        {:else if fileData.mimeType.startsWith('image/')}
                                                            <div class="rounded-lg overflow-hidden">
                                                                
                                                                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                                                <img 
                                                                    src={fileData.previewUrl} 
                                                                    alt={fileData.name}
                                                                    class="max-w-full h-auto rounded hover:opacity-90 transition-opacity cursor-pointer"
                                                                    on:click={() => window.open(fileData.previewUrl, '_blank')}
                                                                />
                                                            </div>
                                                        {:else}
                                                            <div class=" transition-colors">
                                                                <a 
                                                                    href={fileData.previewUrl}
                                                                    download={fileData.name}
                                                                    class="flex items-center gap-3 text-sm bg-gray-100 p-2 rounded-lg hover:bg-gray-200 border border-gray-200"
                                                                >
                                                                    {#if fileData.mimeType.startsWith('video/')}
                                                                        <Film class="h-5 w-5 text-blue-500" />
                                                                    {:else if fileData.mimeType.includes('pdf')}
                                                                        <FileText class="h-5 w-5 text-red-500" />
                                                                    {:else if fileData.mimeType.includes('word') || fileData.mimeType.includes('document')}
                                                                        <FileText class="h-5 w-5 text-blue-500" />
                                                                    {:else}
                                                                        <FileArchive class="h-5 w-5 text-gray-500" />
                                                                    {/if}
                                                                    
                                                                    <div class="flex-1 min-w-0">
                                                                        <div class="truncate font-medium">{fileData.name}</div>
                                                                        <div class="text-xs text-gray-500">
                                                                            {formatFileSize(fileData.sizeOriginal)} • {fileData.mimeType.split('/')[1].toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        {/if}
                                                    {:catch error}
                                                        <div class="rounded-lg border border-red-200 p-3 bg-red-50 text-red-700 text-sm">
                                                            Failed to load attachment
                                                        </div>
                                                    {/await}
                                                {/each}
                                            </div>
                                        {/if}
                                        
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
                        </ContextMenu.Trigger>
                        {#if message.sender_type === 'agent' || message.sender_type === 'ai'}
                            <ContextMenu.Content>
                                <ContextMenu.Item on:click={() => {
                                    inboxActions.toggleEditMode();
                                    handleEditMessage(message);
                                }}>
                                    <Edit class="h-4 w-4 mr-2" />
                                    Edit Message
                                </ContextMenu.Item>
                                <ContextMenu.Item on:click={() => messageToDelete = message}>
                                    <Trash2 class="h-4 w-4 mr-2" />
                                    Delete Message
                                </ContextMenu.Item>
                            </ContextMenu.Content>
                        {/if}
                    </ContextMenu.Root>
                </div>
            {/each}
        {:else}
            <div class="flex items-center justify-center h-full">
                <p class="text-gray-500">No messages in this ticket</p>
            </div>
        {/if}
    </div>
</div>

<AlertDialog.Root open={!!messageToDelete}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete Message</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel on:click={() => messageToDelete = null}>
                Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action 
                on:click={() => messageToDelete && handleDeleteMessage(messageToDelete)}
                class="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 focus:ring-red-200"
            >
                Delete
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
