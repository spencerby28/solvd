<script lang="ts">
    import CustomArc from '$lib/components/dashboard/CustomArc.svelte';
</script>

<div class="p-6">
    <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600">Track your key metrics and performance indicators</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CustomArc 
            value={78}
            title="Customer Satisfaction"
            gradientFrom="22c55e"
            gradientTo="3b82f6"
            useHex={true}
        />
        
        <CustomArc 
            value={92}
            title="Response Rate"
            gradientFrom="3b82f6"
            gradientTo="ef4444"
            useHex={true}
        />

        <CustomArc 
            value={64}
            title="Issue Resolution"
            gradientFrom="ef4444"
            gradientTo="f97316"
            useHex={true}
        />

        <CustomArc 
            value={85}
            title="Team Performance"
            gradientFrom="f97316"
            gradientTo="22c55e"
            useHex={true}
        />
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 bg-white rounded-xl border shadow-md">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div class="space-y-4">
                {#each Array(5) as _, i}
                    <div class="flex items-center gap-4 text-sm">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-gray-600">Activity item {i + 1}</span>
                        <span class="ml-auto text-gray-400">2h ago</span>
                    </div>
                {/each}
            </div>
        </div>

        <div class="p-6 bg-white rounded-xl border shadow-md">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div class="grid grid-cols-2 gap-4">
                {#each [
                    { label: 'Total Tickets', value: '1,234' },
                    { label: 'Open Issues', value: '56' },
                    { label: 'Avg Response', value: '2.3h' },
                    { label: 'Team Members', value: '12' }
                ] as stat}
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-600">{stat.label}</p>
                        <p class="text-xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
