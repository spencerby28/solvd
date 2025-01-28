<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import Avatar from '$lib/components/ui/Avatar.svelte';
    import * as Dropdown from '$lib/components/ui/dropdown-menu';
    import type { PageData } from './$types';
    
    let avatarFile: File | null = null;
    let avatarPreview: string | null = null;
    let dropdownOpenStates: { [key: string]: boolean } = {};
    let selectedDepartment = '';
    let selectedRole = '';
    let selectedStatus = '';
    let inviteEmail = '';

    export let data: PageData;
    console.log(data.agents)
    
    function handleAvatarChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            avatarFile = input.files[0];
            avatarPreview = URL.createObjectURL(input.files[0]);
        }
    }

    async function handleRemoveMember(memberId: string) {
        const confirmed = confirm('Are you sure you want to remove this team member?');
        if (confirmed) {
            const response = await fetch(`/api/team/members/${memberId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                window.location.reload();
            }
        }
    }

    async function handleStatusChange(agentId: string, newStatus: string) {
        // Implement status change logic
    }

    async function handleRoleChange(agentId: string, newRole: string) {
        // Implement role change logic
    }

    // Add tab state management
    type Tab = 'profile' | 'security' | 'team';
    let activeTab: Tab = 'profile';

    // Add validation function
    function isValidInvite() {
        return inviteEmail && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail) && 
               selectedDepartment && 
               selectedRole && 
               selectedStatus;
    }
</script>

<div class="min-h-screen bg-gray-50/50">
    <div class="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Settings tabs">
                <button
                    class="pb-4 px-1 border-b-2 text-sm font-medium {activeTab === 'profile' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => activeTab = 'profile'}
                >
                    Profile
                </button>
                <button
                    class="pb-4 px-1 border-b-2 text-sm font-medium {activeTab === 'security' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => activeTab = 'security'}
                >
                    Security
                </button>
                <button
                    class="pb-4 px-1 border-b-2 text-sm font-medium {activeTab === 'team' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => activeTab = 'team'}
                >
                    Team Members
                </button>
            </nav>
        </div>

        <!-- Tab Panels -->
        {#if activeTab === 'profile'}
            <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                    <h2 class="text-lg font-medium text-gray-900">Profile Settings</h2>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Avatar Upload -->
                    <div class="space-y-3">
                        <label class="text-sm font-medium text-gray-700">Profile Picture</label>
                        <div class="flex items-center space-x-4">
                            <div class="w-20 h-20 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                                {#if avatarPreview}
                                    <img src={avatarPreview} alt="Avatar preview" class="w-full h-full object-cover" />
                                {:else}
                                    <Avatar user={$page.data.user} size="lg" />
                                {/if}
                            </div>
                            <label class="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-green-500 transition-colors cursor-pointer shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Upload New Picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    on:change={handleAvatarChange}
                                />
                            </label>
                        </div>
                    </div>

                    <!-- Personal Information Form -->
                    <form method="POST" action="?/updateProfile" use:enhance class="space-y-4">
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-gray-900"
                                    value={$page.data.user?.name || ''}
                                />
                            </div>
                            <div class="space-y-2">
                                <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-500"
                                    value={$page.data.user?.email || ''}
                                    disabled
                                />
                            </div>
                        </div>
                        <div class="pt-2">
                            <button
                                type="submit"
                                class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        {/if}

        {#if activeTab === 'security'}
            <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                    <h2 class="text-lg font-medium text-gray-900">Security</h2>
                </div>
                
                <div class="p-6">
                    <form method="POST" action="?/updatePassword" use:enhance class="space-y-4">
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label for="currentPassword" class="text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                            <div class="space-y-2">
                                <label for="newPassword" class="text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                            <div class="space-y-2">
                                <label for="confirmPassword" class="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>
                        <div class="pt-2">
                            <button
                                type="submit"
                                class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        {/if}

        {#if activeTab === 'team'}
            <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="border-b border-gray-200 bg-gray-50/80 px-6 py-4">
                    <h2 class="text-lg font-medium text-gray-900">Team Management</h2>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Agents List -->
                    <div class="">
                        <div class="overflow-x-auto rounded-lg border border-gray-200">
                            <div class="max-h-[600px] overflow-y-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Agent</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Department</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Role</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        {#each data.agents || [] as agent}
                                            <tr class="hover:bg-gray-50">
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-shrink-0 h-10 w-10">
                                                            <Avatar user={agent} size="sm" />
                                                        </div>
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900">{agent.name}</div>
                                                            <div class="text-sm text-gray-500">{agent.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="text-sm text-gray-900">{agent.department || '-'}</div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="text-sm text-gray-900 capitalize">{agent.role}</div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        {agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                                        {agent.status}
                                                    </span>
                                                </td>

                                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Dropdown.Root bind:open={dropdownOpenStates[agent.$id]}>
                                                        <Dropdown.Trigger class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 transition-colors ml-auto">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            </svg>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                                                </svg>
                                                                Change Role
                                                            </Dropdown.Item>
                                                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                                                    <path fill-rule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clip-rule="evenodd" />
                                                                </svg>
                                                                {agent.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Agent
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50"
                                                                on:click={() => handleRemoveMember(agent.$id)}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                                                    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                                                                </svg>
                                                                Remove Agent
                                                            </Dropdown.Item>
                                                        </Dropdown.Content>
                                                    </Dropdown.Root>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Invite New Member Form -->
                    <form method="POST" action="?/inviteMember" use:enhance class="space-y-4">
                        <h3 class="text-lg font-medium text-gray-700">Invite New Member</h3>
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label for="inviteEmail" class="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    id="inviteEmail"
                                    name="inviteEmail"
                                    bind:value={inviteEmail}
                                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                    placeholder="colleague@example.com"
                                />
                            </div>

                            <h4 class="text-sm font-medium text-gray-700">Configure Profile</h4>
                            <div class="flex items-center gap-4">
                                <div class="flex gap-4 flex-1">
                                    <Dropdown.Root>
                                        <Dropdown.Trigger class="min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:bg-gray-50 flex items-center justify-between {selectedDepartment ? 'border-green-600 text-green-700 bg-green-50' : ''}">
                                            <span>{selectedDepartment || 'Department'}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                            {#each ['Sales', 'Support', 'Engineering', 'Marketing'] as dept}
                                                <Dropdown.Item 
                                                    class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between {selectedDepartment === dept ? 'text-green-700 bg-green-50' : 'text-gray-700'}"
                                                    on:click={() => selectedDepartment = dept}
                                                >
                                                    {dept}
                                                    {#if selectedDepartment === dept}
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                        </svg>
                                                    {/if}
                                                </Dropdown.Item>
                                            {/each}
                                        </Dropdown.Content>
                                    </Dropdown.Root>

                                    <Dropdown.Root>
                                        <Dropdown.Trigger class="min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:bg-gray-50 flex items-center justify-between {selectedRole ? 'border-green-600 text-green-700 bg-green-50' : ''}">
                                            <span>{selectedRole || 'Role'}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                            {#each ['Admin', 'Agent', 'Manager'] as role}
                                                <Dropdown.Item 
                                                    class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between {selectedRole === role ? 'text-green-700 bg-green-50' : 'text-gray-700'}"
                                                    on:click={() => selectedRole = role}
                                                >
                                                    {role}
                                                    {#if selectedRole === role}
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                        </svg>
                                                    {/if}
                                                </Dropdown.Item>
                                            {/each}
                                        </Dropdown.Content>
                                    </Dropdown.Root>

                                    <Dropdown.Root>
                                        <Dropdown.Trigger class="min-w-[140px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:bg-gray-50 flex items-center justify-between {selectedStatus ? 'border-green-600 text-green-700 bg-green-50' : ''}">
                                            <span>{selectedStatus || 'Status'}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content class="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                            {#each ['Active', 'Inactive', 'Pending'] as status}
                                                <Dropdown.Item 
                                                    class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between {selectedStatus === status ? 'text-green-700 bg-green-50' : 'text-gray-700'}"
                                                    on:click={() => selectedStatus = status}
                                                >
                                                    {status}
                                                    {#if selectedStatus === status}
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                        </svg>
                                                    {/if}
                                                </Dropdown.Item>
                                            {/each}
                                        </Dropdown.Content>
                                    </Dropdown.Root>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isValidInvite()}
                                    class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                    </svg>
                                    Send Invitation
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        {/if}
    </div>
</div>
