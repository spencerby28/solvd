<script lang="ts">
    
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { slide, fade } from 'svelte/transition';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Users } from 'lucide-svelte';
    import * as Collapsible from '$lib/components/ui/collapsible';
    import { goto } from '$app/navigation';
    import ChangeTenant from '$lib/components/modals/ChangeTenant.svelte';

    export let isCollapsed = false;
    

    // Mock tenant data
    const tenant = {
        id: 'tenant-123',
        tenant_name: 'SB28',
        avatar_url: 'https://ui-avatars.com/api/?name=SB28&background=16a34a&color=fff',
        user_ids: ['user-1', 'user-2'],
        primary_contact_email: 'contact@sb28.com',
        business_email_domain: 'sb28.com',
        billing_email: 'billing@sb28.com',
        subscription_tier: 'enterprise',    
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    };

    // Get the current user from page data
    $: user = $page.data.user;
   
    
   

    // Track open state for each navigation item
    let openSections = new Set<string>();

    let isMounted = false;
    onMount(() => {
        isMounted = true;
    });

    // Check if a navigation item is active based on the current path and query params
    $: currentPath = $page.url.pathname;
    $: currentSearchParams = $page.url.searchParams;
    $: currentUrl = $page.url.toString();
    $: isActive = (href: string) => {
        // For parent/heading items, check if we're in their section
        if (href === '/app/inbox/main' || href === '/app/customers' || href === '/app/analytics' || href === '/app/helpdesk') {
            return currentPath.startsWith(href);
        }

        // Special case for assigned parameter
        if (href === '#' && currentSearchParams.has('assigned')) {
            return true;
        }

        // Only do full URL matching if we're mounted on the client
        if (isMounted) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.origin).toString();
            return currentUrl === fullUrl;
        }
        
        // Fallback to simple path matching during SSR
        return currentPath === href;
    };

    // Check if a sub-item should show border highlight (exact matches only)
    $: isSubItemActive = (href: string, parentHref: string) => {
        // Special case for assigned parameter
        if (href === '#' && currentSearchParams.has('assigned')) {
            return true;
        }

        // Only do full URL matching if we're mounted on the client
        if (isMounted) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.origin).toString();
            return currentUrl === fullUrl;
        }

        // Fallback to simple path matching during SSR
        return currentPath === href;
    };

    function toggleSection(label: string) {
        if (!isCollapsed) {
            // Don't allow closing if the section is active
            if (navigationItems.find(item => item.label === label)?.items.some(subItem => isActive(subItem.href))) {
                openSections.add(label);
            } else if (openSections.has(label)) {
                openSections.delete(label);
            } else {
                openSections.add(label);
            }
            openSections = openSections;
        }
    }

    // Keep sections open if they contain active items
    $: {
        navigationItems.forEach(item => {
            if (item.items.some(subItem => isActive(subItem.href))) {
                openSections.add(item.label);
                openSections = openSections;
            }
        });
    }

    // Navigation items with their sub-items
    const navigationItems = [
        {
            label: 'Inbox',
            icon: 'inbox',
            href: '/app/inbox/main',
            items: [
                { label: 'All', href: '/app/inbox/main' },
                { 
                    label: 'Assigned', 
                    href: '#',
                    onClick: () => goto(`/app/inbox?assigned=${user?.$id}`)
                },
                { label: 'Active', href: '/app/inbox?active=true' },
                { label: 'Archived', href: '/app/inbox?archived=true' }
            ]
        },
        {
            label: 'Customers',
            icon: 'users',
            href: '/app/customers',
            items: [
                { label: 'All Customers', href: '/app/customers' },
                { label: 'Active', href: '/app/customers?active=true' },
                { label: 'Inactive', href: '/app/customers?active=false' }
            ]
        },
        {
            label: 'Helpdesk',
            icon: 'help-circle',
            href: '/app/helpdesk',
            items: [],
        },
        {
            label: 'Analytics',
            icon: 'bar-chart',
            href: '/app/analytics',
            items: [
                { label: 'Dashboard', href: '/app/analytics' },
                { label: 'Reports', href: '/app/analytics/reports' },
                { label: 'Metrics', href: '/app/analytics/metrics' }
            ]
        }
    ];

    // Add these variables to manage the modal state
    let changeTenantOpen = false;
    
    // Function to handle modal state changes
    function handleChangeTenantOpenChange(open: boolean) {
        changeTenantOpen = open;
    }

//TODO: create separate inboxes on customer level and company levl store index id in appwrite on fetch of customer + the tenant we will set them in layour + url instead of /inbox/main

//TODO: fix bottom so it navs immediatly to section, could have collapsible box up for settings woudl look cool
//TODO: save the state of the sidebar in local storage
//TODO FIX LINKS
</script>

<aside class="flex flex-col h-full border-r border-gray-200 transition-all duration-300 {isCollapsed ? 'w-16' : 'w-56'} relative">
    <!-- Tenant Info - Fixed at top -->
    <div class="flex-none p-4  group relative">
        <!-- svelte-ignore a11y_no-static-element-interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="flex items-center gap-3 cursor-pointer" on:click={() => goto('/')}>
            <img 
                src={tenant.avatar_url} 
                alt={tenant.tenant_name}
                class="rounded-xl transition-all duration-300 {isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}"
            />
            {#if !isCollapsed}
                <div transition:slide|local>
                    <h2 class="font-medium text-gray-900">{tenant.tenant_name}</h2>
                    <p class="text-sm text-gray-500">{tenant.subscription_tier}</p>
                </div>
            {/if}
        </div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button 
            class="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg absolute transition-all duration-300 opacity-0 group-hover:opacity-100 {isCollapsed ? 'right-[-12px] top-4' : 'right-4 top-4'}"
            on:click={() => isCollapsed = !isCollapsed}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                class="w-5 h-5 text-gray-500 hover:text-gray-600 transition-transform duration-300 {isCollapsed ? 'rotate-180' : ''}"
            >
                <path d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" />
            </svg>
        </button>
    </div>

    <!-- Main Navigation - Scrollable -->
    <nav class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
        <div class="p-4">
            {#each navigationItems as item}
                {#if item.label === 'Helpdesk'}
                    <!-- Helpdesk without dropdown -->
                    <a 
                        href={item.href}
                        class="w-full p-2 flex items-center mb-3 {isActive(item.href) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'} rounded-lg {isCollapsed ? 'justify-center' : ''}"
                    >
                        <div class="flex items-center {isCollapsed ? 'gap-0' : 'gap-4'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            {#if !isCollapsed}
                                <span class="font-semibold">{item.label}</span>
                            {/if}
                        </div>
                    </a>
                {:else}
                    <Collapsible.Root 
                        class="w-full overflow-hidden mb-3 last:mb-0"
                        open={openSections.has(item.label)}
                    >
                        <div class="w-full">
                            <Collapsible.Trigger 
                                class="w-full p-2 flex items-center {isActive(item.href) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'} rounded-lg {isCollapsed ? 'justify-center' : ''}"
                                on:click={() => goto(item.href)}
                            >
                                <div class="flex items-center {isCollapsed ? 'gap-0' : 'gap-4'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        {#if item.icon === 'inbox'}
                                            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                                        {:else if item.icon === 'users'}
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        {:else if item.icon === 'bar-chart'}
                                            <line x1="18" y1="20" x2="18" y2="10" />
                                            <line x1="12" y1="20" x2="12" y2="4" />
                                            <line x1="6" y1="20" x2="6" y2="14" />
                                        {/if}
                                    </svg>
                                    {#if !isCollapsed}
                                        <span class="font-semibold">{item.label}</span>
                                    {/if}
                                </div>
                            </Collapsible.Trigger>
                            {#if !isCollapsed}
                                <Collapsible.Content>
                                    <div class="w-full space-y-1 pt-2" transition:slide|local={{ duration: 200 }}>
                                        {#each item.items as subItem}
                                            {#if subItem.onClick}
                                                <button 
                                                    on:click={subItem.onClick}
                                                    class="block w-full px-2 py-2 text-sm text-left {isSubItemActive(subItem.href, item.href) ? 'ring-2 ring-inset ring-green-600 text-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} rounded-lg"
                                                >
                                                    {subItem.label}
                                                </button>
                                            {:else}
                                                <a 
                                                    href={subItem.href} 
                                                    class="block w-full px-2 py-2 text-sm {isSubItemActive(subItem.href, item.href) ? 'ring-2 ring-inset ring-green-600 text-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} rounded-lg"
                                                >
                                                    {subItem.label}
                                                </a>
                                            {/if}
                                        {/each}
                                    </div>
                                </Collapsible.Content>
                            {/if}
                        </div>
                    </Collapsible.Root>
                {/if}
            {/each}
        </div>
    </nav>

    <!-- Bottom Section - Fixed at bottom -->
    <div class="flex-none">
        <div class="p-4">
            <!-- Settings -->
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class="w-full p-2 flex items-center {isCollapsed ? 'justify-center' : 'justify-between'} {isActive('app/settings') ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'} rounded-lg" on:click={() => goto('/settings')}>
                    <div class="flex items-center {isCollapsed ? 'gap-0' : 'gap-4'}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        {#if !isCollapsed}
                            <span class="font-bold" transition:slide|local>Settings</span>
                        {/if}
                    </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item href="/settings/account">Account</DropdownMenu.Item>
                    <DropdownMenu.Item href="/settings/preferences">Preferences</DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item href="/settings/team">Team Settings</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <!-- User Profile -->
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class="w-full flex items-start {isActive('/user') ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'} rounded-lg py-2 px-1" on:click={() => goto('/user')}>
                    <div class="flex items-center gap-2">
                        {#if user}
                            <img 
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=16a34a&color=fff`}
                                alt={user.name}
                                class="w-8 h-8 rounded-full transition-all duration-200"
                            />
                            {#if !isCollapsed}
                                <div class="flex flex-col items-start" transition:slide|local>
                                    <span class="text-sm font-medium">{user.name}</span>
                                    <span class="text-xs text-gray-500">{user.email}</span>
                                </div>
                            {/if}
                        {/if}
                    </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item href="app/profile">View Profile</DropdownMenu.Item>
                    <DropdownMenu.Item href="app/profile/notifications">Notifications</DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item class="text-red-600" href="/auth/logout">Sign out</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <!-- Modify the team switcher button to open the modal instead of navigating -->
            <button 
                class="w-full p-2 mb-2 flex items-center {isCollapsed ? 'justify-center' : 'justify-between'} {isActive('/app/teams') ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'} rounded-lg"
                on:click={() => changeTenantOpen = true}
            >
                <div class="flex items-center {isCollapsed ? 'gap-0' : 'gap-4'}">
                    <Users class="w-5 h-5" />
                    {#if !isCollapsed}
                        <span class="font-bold" transition:slide|local>Switch Team</span>
                    {/if}
                </div>
            </button>
        </div>
    </div>
</aside>

<!-- Add the modal component just before the closing </aside> tag -->
<ChangeTenant 
    open={changeTenantOpen}
    onOpenChange={handleChangeTenantOpenChange}
    userId={user?.$id}
    currentTenant={user?.prefs?.tenantId}
/>

<style>
    /* Add smooth transitions for width changes */
    aside {
        will-change: width;
    }
</style>
