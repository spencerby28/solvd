<script lang="ts">
    import { slide } from 'svelte/transition';
    import RippleButton from '$lib/components/primatives/RippleButton.svelte';
    import type { Tickets } from '$lib/types';
    //@ts-ignore
    import { countryCodeEmoji } from 'country-code-emoji';
    import { onMount } from 'svelte';
    import { collapsed } from '$lib/stores/collapsed';
    import {Clock, MapPin} from 'lucide-svelte';

    export let ticket: Tickets | undefined;

    // Add status type and current status
    type Status = 'online' | 'away' | 'offline';
    let currentStatus: Status = 'offline';
    let timeInterval: NodeJS.Timeout;
    let loading = false;

    // Format last seen absolute time
    function formatLastSeen(date: Date): string {
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Format relative time (e.g., "2h ago")
    function formatRelativeTime(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const diffInHours = Math.floor(diffInSeconds / 3600);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMinutes = Math.floor(diffInSeconds / 60);

        if (diffInSeconds < 30) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ${diffInHours % 24}h ago`;
    }

    // Calculate status based on last seen timestamp
    function calculateStatus(lastSeen: string | null | undefined): Status {
        if (!lastSeen) return 'offline';
        
        try {
            const lastSeenDate = new Date(lastSeen);
            const now = new Date();
            const diffInSeconds = (now.getTime() - lastSeenDate.getTime()) / 1000;

            if (diffInSeconds <= 30) return 'online';
            if (diffInSeconds <= 300) return 'away'; // 5 minutes = 300 seconds
            return 'offline';
        } catch (e) {
            return 'offline';
        }
    }

    // Calculate last seen text
    function getLastSeenText(lastSeen: string | null | undefined): string {
        if (!lastSeen) return 'Never';
        try {
            const lastSeenDate = new Date(lastSeen);
            const formattedDate = lastSeenDate.toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });
            return `${formattedDate}\n(${formatRelativeTime(lastSeenDate)})`;
        } catch (e) {
            return 'Never';
        }
    }

    // Update status every second for active users
    onMount(() => {
        const updateStatus = () => {
            if (ticket?.customer_last_seen) {
                currentStatus = calculateStatus(ticket.customer_last_seen instanceof Date ? ticket.customer_last_seen.toISOString() : ticket.customer_last_seen);
            }
        };

        // Initial update
        updateStatus();
        
        // Update status every second
        timeInterval = setInterval(updateStatus, 1000);

        return () => {
            if (timeInterval) clearInterval(timeInterval);
        };
    });

    // Status color mapping
    $: statusColor = {
        online: '#16a34a', // green
        away: '#eab308',   // yellow
        offline: '#dc2626'  // red
    }[currentStatus];

    $: currentStatus = calculateStatus(ticket?.customer_last_seen instanceof Date ? ticket.customer_last_seen.toISOString() : ticket?.customer_last_seen);
    $: lastSeenText = getLastSeenText(ticket?.customer_last_seen instanceof Date ? ticket.customer_last_seen.toISOString() : ticket?.customer_last_seen);

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
        if (!timezone) return '';
        if (timezone === 'UTC') return 'UTC';
        return timezone.split('/')[1]?.replace(/_/g, ' ') || timezone;
    }

    $: userTime = ticket?.customer_timezone ? formatUserTime(ticket.customer_timezone) : '';
    $: languageName = ticket?.customer_locale ? getLanguageName(ticket.customer_locale) : '';
    $: countryName = ticket?.customer_locale ? getCountryName(ticket.customer_locale) : '';
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
        animation: none;
        transition: background-color 0.2s ease;
    }

    .status-indicator[data-status="online"] {
        --status-shadow-color: 22, 163, 74;
        animation: status-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
    }

    .status-indicator[data-status="away"] {
        --status-shadow-color: 234, 179, 8;
    }

    .status-indicator[data-status="offline"] {
        --status-shadow-color: 220, 38, 38;
    }

    /* Add a minimal height constraint to prevent initial jolt */
    :global(.slide-transition) {
        min-height: 0;
        height: auto !important;
    }


</style>

<div class="p-4 relative group/info">
    <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-xl bg-[#16a34a] bg-opacity-60 flex items-center justify-center relative shrink-0 transition-all duration-300 {$collapsed ? 'w-8 h-8' : ''}">
            <span class="text-xl font-bold text-white transition-all duration-300 {$collapsed ? 'text-base' : ''}">D</span>
            <div 
                class="status-indicator absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white transform translate-x-1 -translate-y-1"
                style="background-color: {statusColor}"
                data-status={currentStatus}
            >
                {#if currentStatus !== 'offline'}
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">{lastSeenText}</div>
                {/if}
            </div>
        </div>
        {#if !$collapsed}
            <div class="min-w-0 flex-1 slide-transition" transition:slide|local>
                {#if loading}
                    <div class="space-y-2">
                        <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                {:else}
                    <p class="text-2xl font-bold truncate">{ticket?.customer_name}</p>
                    <p class="text-sm text-gray-600 truncate">{ticket?.customer_email || 'No email provided'}</p>
                    {#if currentStatus === 'offline'}
                        <p class="text-xs font-bold text-gray-600 uppercase ">{lastSeenText}</p>
                    {/if}
                {/if}
            </div>
        {/if}
    </div>

    <!-- Collapse button -->
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button 
        class="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg absolute transition-all duration-300 opacity-0 group-hover/info:opacity-100 {$collapsed ? 'left-[-12px] top-4' : 'left-4 top-4'}"
        on:click={() => collapsed.set(!$collapsed)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
            class="w-5 h-5 text-gray-500 hover:text-gray-600 transition-transform duration-300 {$collapsed ? '' : 'rotate-180'}"
        >
            <path d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" />
        </svg>
    </button>

    {#if !$collapsed}
        <div class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 slide-transition" transition:slide|local>
            {#if loading}
                <div class="col-span-2 space-y-4">
                    <div class="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div class="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
            {:else}
                {#if ticket?.customer_timezone}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <Clock class="w-4 h-4 text-gray-700" strokeWidth={3} absoluteStrokeWidth={true}/>
                        </div>
                        <span class="font-medium text-gray-700">{userTime}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-[18px] h-[18px] text-gray-700">
                                <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                            </svg>
                        </div>
                        <span class="text-gray-700">{formatTimezone(ticket.customer_timezone)}</span>
                    </div>
                {/if}
                {#if ticket?.customer_locale}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <span class="text-base font-semibold text-gray-700">Aa</span>
                        </div>
                        <span class="font-medium text-gray-700">{languageName}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 flex items-center justify-center">
                            <span class="text-xl">{countryCodeEmoji(ticket.customer_locale.split('-')[1])}</span>
                        </div>
                        <span class="text-gray-700">{countryName}</span>
                    </div>
                {/if}
            {/if}
        </div>

        <div class="mt-6 slide-transition" transition:slide|local>
            <RippleButton class="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg" rippleColor="#166534" duration="1000ms">
                View Profile
            </RippleButton>
        </div>
    {/if}
</div>
