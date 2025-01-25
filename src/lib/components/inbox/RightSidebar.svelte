<script lang="ts">
    import { Menu, MenuItem, Toggle } from 'svelte-ux';
    import * as Dropdown from '$lib/components/ui/dropdown-menu';
    import Badge from '$lib/components/primatives/Badge.svelte';
    import { onMount } from 'svelte';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import { createBrowserClient } from '$lib/appwrite-browser';
    //@ts-ignore
    import { countryCodeEmoji } from 'country-code-emoji';
    import type { Customers, Tickets } from '$lib/types';

    export let ticket: Tickets | undefined;
    let customer: Customers | undefined;
    let loading = true;

    // Mock internal messages - keeping these as requested
    const mockInternalMessages = [
        {
            id: 'int_6',
            content: 'Fix successfully deployed to production',
            author: 'Sarah Chen',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
            type: 'internal'
        },
        {
            id: 'int_5',
            content: 'QA testing completed on staging, preparing production deployment',
            author: 'David Park',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
            type: 'internal'
        },
        {
            id: 'int_4',
            content: 'Hotfix deployed to staging environment',
            author: 'Jennifer Wu',
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
            type: 'internal'
        },
        {
            id: 'int_3',
            content: 'Engineering confirmed bug in latest release',
            author: 'Mike Johnson', 
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
            type: 'internal'
        },
        {
            id: 'int_2', 
            content: 'Escalated to engineering team for review',
            author: 'Sarah Chen',
            timestamp: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
            type: 'internal'
        },
        {
            id: 'int_1',
            content: 'Customer reported integration issues with API v2',
            author: 'Spencer Byrne',
            timestamp: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
            type: 'internal'
        }
    ];

    let selectedAssignees = new Set<string>();
    let isAssignDropdownOpen = false;
    let isConnectAccountsDropdownOpen = false;
    let expandedAssignee: string | null = null;
    let expandTimeout: NodeJS.Timeout | null = null;

    // Add status type and current status
    type Status = 'online' | 'away' | 'offline';
    let currentStatus: Status = 'online';

    // Status color mapping
    $: statusColor = {
        online: '#16a34a', // green
        away: '#eab308',   // yellow
        offline: '#dc2626'  // red
    }[currentStatus];

    const assignees = [
        // Sales Team
        { name: 'Sarah Johnson', role: 'Sales', color: '#2563eb' },
        { name: 'Mike Peters', role: 'Sales', color: '#2563eb' },
        { name: 'Emma Wilson', role: 'Sales', color: '#2563eb' },
        // Fulfillment Team  
        { name: 'James Rodriguez', role: 'Fulfillment', color: '#16a34a' },
        { name: 'Lisa Chen', role: 'Fulfillment', color: '#16a34a' },
        { name: 'David Smith', role: 'Fulfillment', color: '#16a34a' },
        // Admin Team
        { name: 'Jennifer Taylor', role: 'Admin', color: '#dc2626' },
        { name: 'Michael Chang', role: 'Admin', color: '#dc2626' },
        { name: 'Rachel Green', role: 'Admin', color: '#dc2626' }
    ];

    function toggleAssignee(assignee: string) {
        if (selectedAssignees.has(assignee)) {
            selectedAssignees.delete(assignee);
        } else {
            selectedAssignees.add(assignee);
        }
        selectedAssignees = selectedAssignees;
    }

    function removeAssignee(assignee: string) {
        selectedAssignees.delete(assignee);
        selectedAssignees = selectedAssignees;
    }

    function handleTagClick(assigneeName: string, event: MouseEvent) {
        event.stopPropagation();
        if (expandedAssignee === assigneeName) {
            expandedAssignee = null;
            if (expandTimeout) clearTimeout(expandTimeout);
        } else {
            expandedAssignee = assigneeName;
            if (expandTimeout) clearTimeout(expandTimeout);
            expandTimeout = setTimeout(() => {
                expandedAssignee = null;
            }, 1500);
        }
    }

    function handleClickAway(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.assignee-tag')) {
            expandedAssignee = null;
            if (expandTimeout) clearTimeout(expandTimeout);
        }
    }

    let timeInterval: NodeJS.Timeout;

    // Helper function to calculate ticket duration
    function getTicketDuration(): number {
        if (!ticket) return 0;
        return Math.floor((Date.now() - new Date(ticket.$createdAt).getTime()) / 60000);
    }

    // Helper function to get open tickets
    function getOpenTickets(): Tickets[] {
        if (!ticket) return [];
        return [ticket].filter(t => t.status === 'open');
    }

    $: if (ticket) {
        loading = true;
        const {databases} = createBrowserClient();
        databases.getDocument('tickets', 'customers', ticket.customer_id)
            .then(doc => {
                console.log('Customer:', doc);
                customer = doc as unknown as Customers;
            })
            .catch(error => {
                console.error('Error fetching customer:', error);
            })
            .finally(() => {
                loading = false;
            });
    }


    //@ts-ignore
    onMount(async () => {
        document.addEventListener('click', handleClickAway);



        // Get current seconds and calculate delay until next minute
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
        
        // Initial update
        userTime = customer?.timezone ? formatUserTime(customer.timezone) : '';
        
        // Set timeout to sync with minute boundary
        setTimeout(() => {
            userTime = customer?.timezone ? formatUserTime(customer.timezone) : '';
            // Start interval once synced
            timeInterval = setInterval(() => {
                userTime = customer?.timezone ? formatUserTime(customer.timezone) : '';
            }, 60000);
        }, delay);

        return () => {
            document.removeEventListener('click', handleClickAway);
            if (expandTimeout) clearTimeout(expandTimeout);
            if (timeInterval) clearInterval(timeInterval);
        };
    });

    $: availableAssignees = assignees.filter(a => !selectedAssignees.has(a.name));

    // Format the time based on user's timezone
    function formatUserTime(timezone: string) {
        try {
            return new Date().toLocaleTimeString('en-US', { 
                timeZone: timezone,
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        } catch (e) {
            return '';
        }
    }

    // Get language name from locale
    function getLanguageName(locale: string) {
        try {
            return new Intl.DisplayNames([locale], { type: 'language' }).of(locale.split('-')[0]);
        } catch (e) {
            return locale.split('-')[0].toUpperCase();
        }
    }

    // Get country name from locale
    function getCountryName(locale: string) {
        try {
            const countryCode = locale.split('-')[1];
            return new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode);
        } catch (e) {
            return locale.split('-')[1];
        }
    }

    // Format timezone name
    function formatTimezone(timezone: string) {
        return timezone.split('/')[1].replace(/_/g, ' ');
    }

    function formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 600) { // Less than 10 hours
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        } else if (minutes < 1440) { // Less than 24 hours
            const hours = Math.floor(minutes / 60);
            return `${hours}hr`;
        } else { // Days
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return hours > 0 ? `${days}d ${hours}hr` : `${days}d`;
        }
    }

    function getResponseTimeColor(minutes: number): string {
        if (minutes < 10) return 'text-green-600';
        if (minutes < 30) return 'text-yellow-500';
        return 'text-red-500';
    }

    $: userTime = customer?.timezone ? formatUserTime(customer.timezone) : '';
    $: languageName = customer?.locale ? getLanguageName(customer.locale) : '';
    $: countryName = customer?.locale ? getCountryName(customer.locale) : '';
</script>

<style>
    @keyframes status-pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(var(--status-shadow-color), 0.7);
        }
        70% {
            box-shadow: 0 0 0 6px rgba(var(--status-shadow-color), 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(var(--status-shadow-color), 0);
        }
    }

    .status-indicator {
        animation: status-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
        transition: background-color 0.2s ease;
    }

    .status-indicator[data-status="online"] {
        --status-shadow-color: 22, 163, 74;
    }

    .status-indicator[data-status="away"] {
        --status-shadow-color: 234, 179, 8;
    }

    .status-indicator[data-status="offline"] {
        --status-shadow-color: 220, 38, 38;
    }
</style>

<aside class="w-80 bg-gray-100 border-x border-gray-200 shadow-lg relative rounded-l-3xl flex flex-col h-screen overflow-hidden">	
    <div class="p-4">
        <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-[#16a34a] bg-opacity-60 flex items-center justify-center relative shrink-0">
                <span class="text-xl font-bold text-white">D</span>
                <div 
                    class="status-indicator absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white transform translate-x-1 -translate-y-1"
                    style="background-color: {statusColor}"
                    data-status={currentStatus}
                ></div>
            </div>
            <div class="min-w-0 flex-1">
                {#if loading}
                    <div class="space-y-2">
                        <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                {:else}
                    <p class="text-2xl font-bold truncate">{customer?.name}</p>
                    <p class="text-sm text-gray-600 truncate">{customer?.email || 'No email provided'}</p>
                {/if}
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
            {#if loading}
                <div class="col-span-2 space-y-4">
                    <div class="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div class="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
            {:else}
                {#if customer?.timezone}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-[18px] h-[18px] text-gray-700">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="font-medium text-gray-700">{userTime}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-[18px] h-[18px] text-gray-700">
                                <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                            </svg>
                        </div>
                        <span class="text-gray-700">{formatTimezone(customer.timezone)}</span>
                    </div>
                {/if}
                {#if customer?.locale}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <span class="text-base font-semibold text-gray-700">Aa</span>
                        </div>
                        <span class="font-medium text-gray-700">{languageName}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <span class="text-xl">{countryCodeEmoji(customer.locale.split('-')[1])}</span>
                        </div>
                        <span class="text-gray-700">{countryName}</span>
                    </div>
                {/if}
            {/if}
        </div>

        <RippleButton class="w-full mt-6 py-2 px-4 bg-green-600 text-white font-medium rounded-lg" rippleColor="#166534" duration="1000ms">
            View Profile
        </RippleButton>
    </div>
    <div class="p-4 border-t border-gray-200">
        {#if selectedAssignees.size > 0}
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs text-gray-500">ASSIGNED TO</p>
                <Dropdown.Root bind:open={isAssignDropdownOpen}>
                    <Dropdown.Trigger class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-50 text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </Dropdown.Trigger>
                    <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ml-auto">
                        {#if availableAssignees.length === 0}
                            <div class="px-3 py-2 text-sm text-gray-500">No more assignees available</div>
                        {:else}
                            {#each availableAssignees as assignee}
                                <Dropdown.Item 
                                    class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between"
                                    on:click={() => toggleAssignee(assignee.name)}
                                >
                                    <span>{assignee.name}</span>
                                    <Badge outline={true} text={assignee.role} color={assignee.color} />
                                </Dropdown.Item>
                            {/each}
                        {/if}
                    </Dropdown.Content>
                </Dropdown.Root>
            </div>
        {/if}

        {#if selectedAssignees.size === 0}
            <Dropdown.Root bind:open={isAssignDropdownOpen}>
                <Dropdown.Trigger class="w-full py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Assign to
                </Dropdown.Trigger>
                <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {#each assignees as assignee}
                        <Dropdown.Item 
                            class="px-3 py-2 text-sm cursor-pointer flex items-center justify-between"
                            on:click={() => toggleAssignee(assignee.name)}
                        >
                            <span>{assignee.name}</span>
                            <Badge outline={true} text={assignee.role} color={assignee.color} />
                        </Dropdown.Item>
                    {/each}
                </Dropdown.Content>
            </Dropdown.Root>
        {:else}
            <div class="flex flex-wrap gap-2">
                {#each Array.from(selectedAssignees) as assigneeName}
                    {@const assignee = assignees.find(a => a.name === assigneeName)}
                    <!--@svelte-ignore a11y-no-static-element-interactions-->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div 
                        aria-label="Assignee tag"
                        aria-roledescription="Assignee tag"
                        class="assignee-tag group flex items-center text-center transition-all duration-300 {expandedAssignee === assigneeName ? 'pr-7' : ''} relative bg-white text-gray-900 font-medium px-3 py-1.5 rounded-md text-sm border cursor-pointer" 
                        style="border-color: {assignee?.color || '#16a34a'}"
                        on:click={(e) => handleTagClick(assigneeName, e)}
                    >
                        <span class="mx-auto">{assigneeName}</span>

                        <button 
                            aria-label="Remove assignee"
                            class="absolute right-2 transition-all duration-300 {expandedAssignee === assigneeName ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
                            on:click={(e) => {
                                e.stopPropagation();
                                removeAssignee(assigneeName);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-500 hover:text-gray-700">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
            
        {/if}
    </div>

    <!-- Quick Actions Section -->
    <div class="p-4 border-t border-gray-200">
        <p class="text-xs text-gray-500 mb-3">QUICK ACTIONS</p>
        <div class="grid grid-cols-2 gap-2">
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#16a34a"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                    </svg>
                    Add Note
                </div>
            </RippleButton>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#dc2626"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    Escalate
                </div>
            </RippleButton>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#16a34a"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                    Send Email
                </div>
            </RippleButton>
            <RippleButton 
                class="p-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700"
                rippleColor="#6b7280"
                duration="500ms"
            >
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                    </svg>
                    Copy ID
                </div>
            </RippleButton>
        </div>
    </div>

    <!-- Connected Accounts -->
    <div class="p-4 border-t border-gray-200">
        {#if !customer?.instagram_username && !customer?.shopify_id}
            <Dropdown.Root bind:open={isConnectAccountsDropdownOpen}>
                <Dropdown.Trigger class="w-full py-2 px-3 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                 External Account
                </Dropdown.Trigger>
                <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                        </div>
                        Connect Instagram
                    </Dropdown.Item>
                    <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-[#16a34a] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                        </div>
                        Connect Shopify
                    </Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Root>
        {:else}
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs text-gray-500">CONNECTED ACCOUNTS</p>
                <Dropdown.Root bind:open={isConnectAccountsDropdownOpen}>
                    <Dropdown.Trigger class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-50 text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </Dropdown.Trigger>
                    <Dropdown.Content class="w-[calc(320px-32px)] bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ml-auto">
                        {#if !customer.instagram_username}
                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                                <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                    </svg>
                                </div>
                                Connect Instagram
                            </Dropdown.Item>
                        {/if}
                        {#if !customer.shopify_id}
                            <Dropdown.Item class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2">
                                <div class="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                                    </svg>
                                </div>
                                Connect Shopify
                            </Dropdown.Item>
                        {/if}
                    </Dropdown.Content>
                </Dropdown.Root>
            </div>
            <div class="space-y-3">
                {#if customer.instagram_username}
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Instagram</p>
                                <p class="text-xs text-gray-500">{customer.instagram_username}</p>
                            </div>
                        </div>
                        <a href="https://instagram.com/{customer.instagram_username}" target="_blank" rel="noopener noreferrer" class="text-sm text-green-600 hover:text-green-700">View</a>
                    </div>
                {/if}

                {#if customer.shopify_id}
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Shopify</p>
                                <p class="text-xs text-gray-500">Connected</p>
                            </div>
                        </div>
                        <button class="text-sm text-green-600 hover:text-green-700">View</button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
    <!-- Ticket Summary -->
    <div class="p-4 border-t border-gray-200">
        <p class="text-xs text-gray-500 mb-3">TICKET SUMMARY</p>
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex flex-col items-center">
                    {#if loading}
                        <div class="h-7 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <span class="text-xs text-gray-500 font-medium mt-1">OPEN TIME</span>
                    {:else}
                        <p class="text-lg font-bold text-gray-900">{formatDuration(getTicketDuration())}</p>
                        <span class="text-xs text-gray-500 font-medium">OPEN TIME</span>
                    {/if}
                </div>
            </div>

            <div class="bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex flex-col items-center">
                    <p class="text-lg font-bold text-green-600">&lt;10m</p>
                    <span class="text-xs text-gray-500 font-medium">RESPONSE GOAL</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Activity Timeline -->
    <div class="px-4 border-t border-gray-200 flex-1 flex flex-col min-h-0">
        <p class="text-xs text-gray-500 my-3">RECENT ACTIVITY</p>
        <div class="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div class="space-y-4 pb-4">
                {#each mockInternalMessages as message, i}
                    <div class="relative flex gap-3">
                        {#if i < mockInternalMessages.length}
                            <div class="absolute left-2 top-4 h-full w-0.5 bg-gray-200"></div>
                        {/if}
                        <div class="w-4 h-4 rounded-full bg-purple-500 relative z-10"></div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900">{message.author}</p>
                            <p class="text-sm text-gray-600 break-words">{message.content}</p>
                            <p class="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                {/each}
                <div class="relative flex gap-3">
                    <div class="w-4 h-4 rounded-full bg-blue-500 relative z-10"></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">Ticket Created</p>
                        {#if ticket?.$createdAt}
                            <p class="text-xs text-gray-500">{new Date(ticket.$createdAt).toLocaleDateString()}</p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</aside>
