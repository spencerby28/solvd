<script lang="ts">
    import {inboxActions} from '$lib/stores/inboxActions';
    import { selectedTicket } from '$lib/stores/derivedSelectedTicket';
    import {Upload, HelpCircle, Brain, SquarePen, X} from 'lucide-svelte';

    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import { uploadFile } from '$lib/db/upload';
    
    $: console.log($inboxActions.internalMessage);
    export let user: any

    let messageContent = '';
    let uploadedFiles: { file: File, id?: string, preview?: string }[] = [];
    $:console.log(uploadedFiles);
    let uploadError: string | null = null;

    async function handleSendMessage() {
        console.log(messageContent);
        if (!messageContent.trim() && uploadedFiles.length === 0) return;
        
        try {
            if (!$selectedTicket) {
                throw new Error('Ticket not found');
            }

            const response = await fetch(`/api/web/message/${$selectedTicket.tenant_id}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: messageContent,
                    ticket_id: $selectedTicket.$id,
                    sender_type: 'agent',
                    channel: $selectedTicket.channel,
                    subject: $selectedTicket.subject || '',
                    sender_id: user?.$id || '',
                    customer_id: $selectedTicket.customer_id,
                    sender_name: user?.name || '',
                    tenant_id: $selectedTicket.tenant_id,
                    email: $selectedTicket.customer_email,
                    internal: $inboxActions.internalMessage,
                    attachments: uploadedFiles.map(f => f.id).filter(Boolean)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageContent = '';
            uploadedFiles = [];
            inboxActions.setInternalMessage(false);
            inboxActions.setUploadMode(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    
    async function handleFileUpload(e: DragEvent | Event) {
        e.preventDefault();
        const files = e instanceof DragEvent 
            ? e.dataTransfer?.files 
            : (e.target as HTMLInputElement).files;
        
        if (!files || !$selectedTicket) return;
        
        uploadError = null;
        
        for (const file of Array.from(files)) {
            try {
                // Check file size (30MB limit)
                if (file.size > 30 * 1024 * 1024) {
                    throw new Error(`File ${file.name} exceeds 30MB limit`);
                }
                
                // Create preview for images
                let preview: string | undefined;
                if (file.type.startsWith('image/')) {
                    preview = URL.createObjectURL(file);
                }
                
                // Add to uploaded files array
                uploadedFiles = [...uploadedFiles, { file, preview }];
                
                // Upload to storage
                const fileId = await uploadFile(
                    file,
                    $selectedTicket.customer_id,
                    // @ts-ignore
                    $selectedTicket.tenant_id,
                    user?.$id || ''
                );
                
                // Update file entry with ID
                uploadedFiles = uploadedFiles.map(f => 
                    f.file === file ? { ...f, id: fileId } : f
                );
                
            } catch (error) {
                console.error('Error uploading file:', error);
                uploadError = error instanceof Error ? error.message : 'Failed to upload file';
                // Remove failed file from array
                uploadedFiles = uploadedFiles.filter(f => f.file !== file);
            }
        }
    }

    function removeFile(fileToRemove: File) {
        uploadedFiles = uploadedFiles.filter(f => f.file !== fileToRemove);
        if (uploadedFiles.length === 0) {
            inboxActions.setUploadMode(false);
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }
</script>

<div class="flex-shrink-0 p-4 bg-white border-t border-gray-200 ">
    <div class="flex gap-2 flex-col">
        {#if $inboxActions.internalMessage}
            <div class="text-sm text-gray-500 -mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span>This is an internal note - the customer won't see it</span>
            </div>
        {/if}

        <!-- File Preview Area - Moved here -->
        {#if uploadedFiles.length > 0}
            <div class="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg mb-3">
                {#each uploadedFiles as {file, preview}, i}
                    <div class="relative group">
                        {#if preview}
                            <img 
                                src={preview} 
                                alt={file.name}
                                class="h-20 w-20 object-cover rounded-lg border border-gray-200"
                            />
                        {:else}
                            <div class="h-20 w-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                <span class="text-xs text-gray-500 text-center px-2 break-words">
                                    {file.name}
                                </span>
                            </div>
                        {/if}
                        
                        <!-- Remove button -->
                        <button
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            on:click={() => removeFile(file)}
                        >
                            <X class="w-3 h-3" />
                        </button>
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Upload Error -->
        {#if uploadError}
            <div class="text-red-500 text-sm mb-3">
                {uploadError}
            </div>
        {/if}
        
        <div class="flex items-center gap-3 mb-3">
            {#if !$inboxActions.internalMessage}
                {#if !$inboxActions.uploadMode}
                    <!-- Edit mode button -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div on:click={() => inboxActions.toggleEditMode()}>
                        <RippleButton 
                            class={`p-2 text-sm ${$inboxActions.isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 rounded-lg flex items-center gap-2 ${$inboxActions.isEditMode ? 'text-white' : 'text-gray-700'}`}
                            rippleColor="#16a34a"
                            duration="500ms"
                        >
                            <div class="flex items-center gap-2">
                                <SquarePen class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                                <span class={$inboxActions.isEditMode ? 'font-bold' : ''}>{$inboxActions.isEditMode ? 'Edit Mode' : 'Edit'}</span>
                            </div>
                        </RippleButton>
                    </div>
                {/if}

                {#if !$inboxActions.isEditMode}
                    <!-- Upload button -->
                    <RippleButton 
                        class={`p-2 text-sm ${$inboxActions.uploadMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 rounded-lg flex items-center gap-2 ${$inboxActions.uploadMode ? 'text-white' : 'text-gray-700'}`}
                        rippleColor="#16a34a"
                        duration="500ms"
                        on:click={() => inboxActions.toggleUploadMode()}
                    >
                        <div class="flex items-center gap-2">
                            <Upload class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                            <span class={$inboxActions.uploadMode ? 'font-bold' : ''}>Attach</span>
                        </div>
                    </RippleButton>

                    {#if !$inboxActions.uploadMode}
                        <RippleButton 
                            class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                            rippleColor="#16a34a"
                            duration="500ms"
                        >
                            <div class="flex items-center gap-2">
                                <HelpCircle class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                                Help Desk
                            </div>
                        </RippleButton>
                        <RippleButton 
                            class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                            rippleColor="#16a34a"
                            duration="500ms"
                        >
                            <div class="flex items-center gap-2">
                                <Brain class="w-4 h-4" strokeWidth={2.5} absoluteStrokeWidth={true}/>
                                SolvdAI
                            </div>
                        </RippleButton>
                    {/if}
                {/if}
            {/if}
        </div>

        <!-- Update the dropzone text to show when files are attached -->
        {#if $inboxActions.uploadMode}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                aria-label="Upload files"
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 text-center hover:border-green-500 transition-colors duration-200"
                on:drop={handleFileUpload}
                on:dragover={handleDragOver}
            >
                <input
                    type="file"
                    id="fileInput"
                    class="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx.txt,.csv,.zip,.mp4"
                    on:change={handleFileUpload}
                />
                <label
                    for="fileInput"
                    class="cursor-pointer flex flex-col items-center gap-2"
                >
                    <Upload class="w-8 h-8 text-gray-400" />
                    <div class="text-sm text-gray-600">
                        <span class="text-green-600 font-medium">Click to upload</span> or drag and drop files here
                    </div>
                    <p class="text-xs text-gray-500">
                        PNG, JPG, PDF, DOC, TXT, CSV, ZIP, MP4 up to 30MB {#if uploadedFiles.length > 0}• {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'} selected{/if}
                    </p>
                </label>
            </div>
        {/if}

        {#if !$inboxActions.uploadMode}
            <div class="flex gap-2">
                <input
                    type="text"
                    bind:value={messageContent}
                    placeholder={$inboxActions.internalMessage ? 'Type your internal note...' : 'Type your message...'}
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm min-h-[40px] outline-none transition-shadow duration-200"
                    on:keydown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                />
          
                    <RippleButton 
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        on:click={handleSendMessage}
                        disabled={!messageContent.trim() && uploadedFiles.length === 0}
                        rippleColor="#166534"
                        duration="1000ms"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </RippleButton>
                
            </div>
        {/if}
    </div>
</div>