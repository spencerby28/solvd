<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    export let data: PageData;

    let customers = [...data.initialCustomers];
    let loading = false; // Changed since data is loaded server-side

    // Handle active filter from URL params
    $: activeFilter = $page.url.searchParams.get('active');

    // Filter customers based on URL param
    $: filteredCustomers = activeFilter 
        ? customers.filter(c => c.active === (activeFilter === 'true'))
        : customers;

    function toggleActiveFilter(active: boolean | null) {
        const url = new URL(window.location.href);
        if (active === null) {
            url.searchParams.delete('active');
        } else {
            url.searchParams.set('active', active.toString());
        }
        goto(url.toString());
    }
</script>

<div class="h-full w-full flex flex-col">
    <div class="sticky top-0 bg-white shadow-sm p-4 z-1">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Customers</h2>
            <div class="flex gap-2">
                <button 
                    class="px-3 py-1.5 text-sm rounded-lg border {activeFilter === null ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}"
                    on:click={() => toggleActiveFilter(null)}
                >
                    All
                </button>
                <button 
                    class="px-3 py-1.5 text-sm rounded-lg border {activeFilter === 'true' ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}"
                    on:click={() => toggleActiveFilter(true)}
                >
                    Active
                </button>
                <button 
                    class="px-3 py-1.5 text-sm rounded-lg border {activeFilter === 'false' ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}"
                    on:click={() => toggleActiveFilter(false)}
                >
                    Inactive
                </button>
            </div>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
        <div class="bg-white rounded-lg border border-gray-200">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#if loading}
                            {#each Array(5) as _}
                                <tr class="animate-pulse">
                                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/3"></div></td>
                                </tr>
                            {/each}
                        {:else}
                            {#each filteredCustomers as customer}
                                <tr class="hover:bg-gray-50 cursor-pointer" on:click={() => goto(`/app/customers/${customer.$id}`)}>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span class="text-sm font-medium text-gray-600">
                                                    {customer.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">{customer.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">{customer.email}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {customer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            {customer.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(customer.$createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            {/each}
                            {#if filteredCustomers.length === 0}
                                <tr>
                                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            {/if}
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
