<script lang="ts">
    import { chatSession } from '$lib/stores/chat';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Package, ShoppingBag, RotateCcw, HelpCircle, MessageSquare } from 'lucide-svelte';
    import { ID } from 'appwrite';
	
	
    const tenantId = $page.params.tenantId;

    function handleClick(type: string) {
        const ticketId = ID.unique();
        return `/chat/${tenantId}/${ticketId}?type=${type}`;
    }
</script>

<svelte:head>
    <title>Chat Support | Get Help with Orders, Products & More</title>
    <meta name="description" content="Get instant help with order tracking, product information, returns & exchanges, and general inquiries through our live chat support." />
    <meta name="keywords" content="customer support, live chat, order tracking, product help, returns, exchanges" />
    <meta property="og:title" content="Chat Support | Get Help with Orders, Products & More" />
    <meta property="og:description" content="Get instant help with order tracking, product information, returns & exchanges, and general inquiries through our live chat support." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Chat Support | Get Help with Orders, Products & More" />
    <meta name="twitter:description" content="Get instant help with order tracking, product information, returns & exchanges, and general inquiries through our live chat support." />
</svelte:head>

<div class="flex flex-col min-h-screen">
    <header class="bg-green-600 text-white py-4">
        <div class="max-w-2xl mx-auto px-4">
            <h1 class="text-2xl font-bold flex items-center gap-2">
                <MessageSquare size={24} />
                Chat Support
            </h1>
        </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-8 flex-1">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <p class="text-lg text-gray-700 leading-relaxed">
                Welcome! I'm here to help with anything you need, from tracking orders to processing returns or answering product questions. What can I help you with today?
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
                href={handleClick('order')}
                class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
                <Package class="text-green-600" size={24} />
                <div class="text-left">
                    <h3 class="font-semibold">Order Tracking</h3>
                    <p class="text-sm text-gray-600">Track your order status and updates</p>
                </div>
            </a>

            <a 
                href={handleClick('product')}
                class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
                <ShoppingBag class="text-green-600" size={24} />
                <div class="text-left">
                    <h3 class="font-semibold">Product Information</h3>
                    <p class="text-sm text-gray-600">Get details about our products</p>
                </div>
            </a>

            <a 
                href={handleClick('returns')}
                class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
                <RotateCcw class="text-green-600" size={24} />
                <div class="text-left">
                    <h3 class="font-semibold">Returns & Exchanges</h3>
                    <p class="text-sm text-gray-600">Process returns or exchanges</p>
                </div>
            </a>

            <a 
                href={handleClick('help')}
                class="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
                <HelpCircle class="text-green-600" size={24} />
                <div class="text-left">
                    <h3 class="font-semibold">General Help</h3>
                    <p class="text-sm text-gray-600">Other questions or inquiries</p>
                </div>
            </a>
        </div>
    </div>
</div>
