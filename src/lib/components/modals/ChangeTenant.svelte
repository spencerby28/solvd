<script lang="ts">

    import * as Dialog from '$lib/components/ui/dialog';
    import { onMount } from 'svelte';
    

    export let open = false;
    export let onOpenChange: (open: boolean) => void;
    export let userId: string;
    export let currentTenant: string;
    
    let tenants: any[] = [];
    let selectedTenant = '';
    let selectedRole = 'admin'; // Default role
    let loading = false;

    onMount(async () => {
        try {
            const response = await fetch('/api/tenant');
            const data = await response.json();
            tenants = data.teams;
        } catch (error) {
            console.error('Error fetching tenants:', error);
        }
    });

    const handleSubmit = async () => {
        if (!selectedTenant || !selectedRole) return;

        
        loading = true;
        try {
            const response = await fetch('/api/tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantId: selectedTenant,
                    role: selectedRole,
                    userId,
                    currentTenant
                })
            });

            if (!response.ok) {
                throw new Error('Failed to change tenant');
            }

            onOpenChange(false);
            window.location.href = '/app/inbox/main';
        } catch (error) {
            console.error('Error changing tenant:', error);
        } finally {
            loading = false;
        }
    };
</script>

<Dialog.Root bind:open onOpenChange={onOpenChange}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title class="text-2xl font-extrabold text-green-600">Change Tenant</Dialog.Title>
            <Dialog.Description>
                Select a tenant and role to change access
            </Dialog.Description>
        </Dialog.Header>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="space-y-2">
                <label for="tenant" class="text-sm font-medium">Tenant</label>
                <select 
                    id="tenant"
                    bind:value={selectedTenant}
                    class="w-full px-3 py-2 border rounded-md"
                    required
                >
                    <option value="">Select a tenant</option>
                    {#each tenants as tenant}
                        <option value={tenant.$id}>{tenant.name}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-2">
                <label for="role" class="text-sm font-medium">Role</label>
                <select
                    id="role"
                    bind:value={selectedRole}
                    class="w-full px-3 py-2 border rounded-md"
                    required
                >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    
                </select>
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
                    {loading ? 'Changing...' : 'Change Tenant'}
                </button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
