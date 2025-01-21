<!-- OmniBox.svelte -->
<script lang="ts">
    export let tickets: Array<{
        id: number;
        title: string;
        status: string;
        handledBy: string;
        priority: string;
    }>;

    let searchTerm = '';
    let statusFilter = 'all';

    $: filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'escalated': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };
</script>

<div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Ticket Overview</h2>
        <div class="flex space-x-4">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search tickets..."
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
                bind:value={statusFilter}
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
                <option value="escalated">Escalated</option>
            </select>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handled By</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each filteredTickets as ticket}
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{ticket.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.title}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(ticket.status)}">
                                {ticket.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.handledBy}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm {getPriorityColor(ticket.priority)}">
                            {ticket.priority}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div> 