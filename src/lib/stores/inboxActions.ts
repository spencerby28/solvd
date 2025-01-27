import { writable, derived } from 'svelte/store';
interface InboxActions {
    isEditMode: boolean;
    selectedMessageId: string | null;
    internalMessage: boolean;
    fileUpload: boolean;
    uploadMode: boolean;
}

function createInboxActionsStore() {
    const { subscribe, set, update } = writable<InboxActions>({
        isEditMode: false,
        selectedMessageId: null,
        internalMessage: false,
        fileUpload: false,
        uploadMode: false
    });

    const isAnyActive = derived({ subscribe }, $state => {
        return $state.isEditMode || 
               $state.selectedMessageId !== null ||
               $state.internalMessage ||
               $state.fileUpload ||
               $state.uploadMode;
    });

    return {
        subscribe,
        isAnyActive,
        toggleEditMode: () => update(state => ({ ...state, isEditMode: !state.isEditMode })),
        setSelectedMessage: (messageId: string | null) => update(state => ({ ...state, selectedMessageId: messageId })),
        reset: () => set({ isEditMode: false, selectedMessageId: null, internalMessage: false, fileUpload: false, uploadMode: false }),
        toggleInternalMessage: () => update(state => ({ ...state, internalMessage: !state.internalMessage })),
        setInternalMessage: (internal: boolean) => update(state => ({ ...state, internalMessage: internal })),
        toggleFileUpload: () => update(state => ({ ...state, fileUpload: !state.fileUpload })),
        toggleUploadMode: () => update(state => ({ ...state, uploadMode: !state.uploadMode })),
        setUploadMode: (mode: boolean) => update(state => ({ ...state, uploadMode: mode }))
    };
}

export const inboxActions = createInboxActionsStore();