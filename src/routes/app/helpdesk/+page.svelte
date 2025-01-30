<script lang="ts">

    import { goto, invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import { FileText, FileIcon, Trash2, Check, Upload, X } from 'lucide-svelte';
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { enhance } from '$app/forms';
    import { toast } from 'svelte-sonner';
    import * as Dialog from "$lib/components/ui/dialog";
    import { uploadFile } from '$lib/db/upload';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    export let data: PageData;

    $: console.log(data.documents);

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getMimeTypeIcon(mimeType: string) {
        switch (mimeType) {
            case 'application/pdf':
                return FileText;
            default:
                return FileIcon;
        }
    }

    let documentToDelete: typeof data.documents[number] | null = null;
    let showUploadModal = false;
    let uploadedFiles: { file: File, id?: string, preview?: string }[] = [];
    let uploadError: string | null = null;

    async function handleDeleteSuccess(documentName: string) {
        await invalidateAll();
        toast.success('Document deleted successfully', {
            icon: Check,
            description: `"${documentName}" has been removed`,
            duration: 5000,
        });
    }

    async function handleFileUpload(e: DragEvent | Event) {
        e.preventDefault();
        const files = e instanceof DragEvent 
            ? e.dataTransfer?.files 
            : (e.target as HTMLInputElement).files;
        
        if (!files || !data.user) return;
        
        uploadError = null;
        
        for (const file of Array.from(files)) {
            try {
                if (file.size > 30 * 1024 * 1024) {
                    throw new Error(`File ${file.name} exceeds 30MB limit`);
                }
                
                let preview: string | undefined;
                if (file.type.startsWith('image/')) {
                    preview = URL.createObjectURL(file);
                }
                
                uploadedFiles = [...uploadedFiles, { file, preview }];
                
                const fileId = await uploadFile(
                    file,
                    data.user.$id,
                    data.user.prefs.tenantId,
                    data.user.$id
                );
                
                uploadedFiles = uploadedFiles.map(f => 
                    f.file === file ? { ...f, id: fileId } : f
                );
                
            } catch (error) {
                console.error('Error uploading file:', error);
                uploadError = error instanceof Error ? error.message : 'Failed to upload file';
                uploadedFiles = uploadedFiles.filter(f => f.file !== file);
            }
        }
    }

    function removeFile(fileToRemove: File) {
        uploadedFiles = uploadedFiles.filter(f => f.file !== fileToRemove);
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }

    async function closeUploadModal() {
        if (uploadedFiles.length > 0) {
            await invalidateAll();
            const fileCount = uploadedFiles.length;
            toast.success(`${fileCount} ${fileCount === 1 ? 'document' : 'documents'} uploaded`, {
                icon: Upload,
                description: 'Your documents have been added to the help center',
                duration: 5000,
            });
        }
        showUploadModal = false;
        uploadedFiles = [];
        uploadError = null;
    }

</script>

<div class="h-full w-full flex flex-col">
    <div class="sticky top-0 bg-white shadow-sm p-4 z-1">
        <h2 class="text-lg font-medium text-gray-900">Help Center</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">
            <!-- Getting Started Section -->
            <div class="mb-12">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Getting Started</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer" 
                         on:click={() => goto('/app/helpdesk/products')}>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="p-3 bg-green-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h4 class="text-lg font-medium text-gray-900">Product Management</h4>
                        </div>
                        <p class="text-gray-600">Learn how to upload and manage your products, including inventory tracking and pricing.</p>
                    </div>

                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                         on:click={() => goto('/app/helpdesk/documentation')}>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="p-3 bg-green-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h4 class="text-lg font-medium text-gray-900">Documentation</h4>
                        </div>
                        <p class="text-gray-600">Access comprehensive guides and API documentation for advanced integrations.</p>
                    </div>
                </div>
            </div>

            <!-- Recently Uploaded Documents Section -->
            <div class="mb-12">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Recently Uploaded Documents</h3>
                <div class="relative">
                    <div class="overflow-x-auto hide-scrollbar">
                        <div class="flex gap-4 pb-4">
                            {#if data.documents && data.documents.length > 0}
                                {#each data.documents as document}
                                    <div class="flex-shrink-0 w-48 h-40 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors p-4 flex flex-col group relative">
                                        <div class="flex-1 flex flex-col">
                                            <div class="flex justify-between items-start mb-3">
                                                <div class="p-2 bg-green-50 rounded-lg">
                                                    <svelte:component 
                                                        this={getMimeTypeIcon(document.mimeType)} 
                                                        class="w-6 h-6 text-green-600" 
                                                    />
                                                </div>
                                                <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Indexed
                                                </span>
                                            </div>
                                            <h4 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{document.name}</h4>
                                            <span class="text-xs text-gray-500 mb-2">{formatFileSize(document.sizeOriginal)}</span>
                                            <div class="mt-auto">
                                                <span class="text-xs text-gray-500">{formatDate(document.$createdAt)}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Trash icon - hidden by default, shown on hover -->
                                        <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                class="p-1.5 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                                on:click|stopPropagation={() => documentToDelete = document}
                                            >
                                                <Trash2 class="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                            
                            <!-- Add Document Card -->
                            <div 
                                class="flex-shrink-0 w-48 h-40 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-gray-100 transition-colors p-4 flex flex-col items-center justify-center cursor-pointer"
                                on:click={() => showUploadModal = true}
                            >
                                <div class="p-3 bg-white rounded-lg mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-gray-600">Add Document</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Support Section -->
            <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Need Help?</h3>
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div class="flex items-center gap-6">
                        <div class="p-3 bg-white rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 class="text-lg font-medium text-gray-900 mb-2">Contact Support</h4>
                            <p class="text-gray-600 mb-4">Our support team is available 24/7 to help you with any questions.</p>
                            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add the Alert Dialog component -->
<AlertDialog.Root open={!!documentToDelete}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete Document</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel on:click={() => documentToDelete = null}>
                Cancel
            </AlertDialog.Cancel>
            <form
                method="POST"
                action="?/deleteDocument"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'success') {
                            const deletedDocName = documentToDelete?.name || 'Document';
                            await handleDeleteSuccess(deletedDocName);
                            documentToDelete = null;
                        }
                    };
                }}
            >
                <input type="hidden" name="fileId" value={documentToDelete?.$id} />
                <AlertDialog.Action
                    type="submit"
                    class="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 focus:ring-red-200"
                >
                    Delete
                </AlertDialog.Action>
            </form>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<!-- Upload Modal -->
<Dialog.Root bind:open={showUploadModal}>
    <Dialog.Content class="max-w-2xl">
        <Dialog.Header>
            <Dialog.Title>Upload Documents</Dialog.Title>
            <Dialog.Description>
                Upload documents to your help center. Supported formats: PDF, DOC, DOCX, TXT.
            </Dialog.Description>
        </Dialog.Header>

        <!-- File Preview Area -->
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

        {#if uploadError}
            <div class="text-red-500 text-sm mb-3">
                {uploadError}
            </div>
        {/if}

        <!-- Upload Area -->
        <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 text-center hover:border-green-500 transition-colors duration-200"
            on:drop={handleFileUpload}
            on:dragover={handleDragOver}
        >
            <input
                type="file"
                id="documentFileInput"
                class="hidden"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                on:change={handleFileUpload}
            />
            <label
                for="documentFileInput"
                class="cursor-pointer flex flex-col items-center gap-2"
            >
                <Upload class="w-8 h-8 text-gray-400" />
                <div class="text-sm text-gray-600">
                    <span class="text-green-600 font-medium">Click to upload</span> or drag and drop files here
                </div>
                <p class="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT up to 30MB {#if uploadedFiles.length > 0}• {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'} selected{/if}
                </p>
            </label>
        </div>

        <Dialog.Footer>
            <Dialog.Close class="btn-secondary" on:click={closeUploadModal}>
                Cancel
            </Dialog.Close>
            <RippleButton
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                disabled={uploadedFiles.length === 0}
                rippleColor="#166534"
                duration="1000ms"
                on:click={async () => await closeUploadModal()}
            >
                Done
            </RippleButton>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
    /* Add these styles to hide scrollbar but keep functionality */
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
</style>
