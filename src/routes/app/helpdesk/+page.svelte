<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<div class="h-full w-full flex flex-col">
    <div class="sticky top-0 bg-white shadow-sm p-4 z-1">
        <h2 class="text-lg font-medium text-gray-900">Help Center</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">
            <!-- Getting Started Section -->
            <div class="mb-12">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Getting Started</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer" 
                         on:click={() => goto('/app/helpdesk/products')}>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="p-3 bg-green-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h4 class="text-lg font-medium text-gray-900">Product Management</h4>
                        </div>
                        <p class="text-gray-600">Learn how to upload and manage your products, including inventory tracking and pricing.</p>
                    </div>

                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                         on:click={() => goto('/app/helpdesk/documentation')}>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="p-3 bg-green-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h4 class="text-lg font-medium text-gray-900">Documentation</h4>
                        </div>
                        <p class="text-gray-600">Access comprehensive guides and API documentation for advanced integrations.</p>
                    </div>
                </div>
            </div>

            <!-- Integrations Section -->
            <div class="mb-12">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Popular Integrations</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                        <img src="/shopify-logo.svg" alt="Shopify" class="h-8 mb-4"/>
                        <h4 class="text-lg font-medium text-gray-900 mb-2">Shopify</h4>
                        <p class="text-sm text-gray-600">Connect your Shopify store to sync products and orders automatically.</p>
                    </div>

                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                        <img src="/woocommerce-logo.svg" alt="WooCommerce" class="h-8 mb-4"/>
                        <h4 class="text-lg font-medium text-gray-900 mb-2">WooCommerce</h4>
                        <p class="text-sm text-gray-600">Integrate with WooCommerce to manage your WordPress store seamlessly.</p>
                    </div>

                    <div class="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                        <img src="/stripe-logo.svg" alt="Stripe" class="h-8 mb-4"/>
                        <h4 class="text-lg font-medium text-gray-900 mb-2">Stripe</h4>
                        <p class="text-sm text-gray-600">Process payments securely with Stripe integration.</p>
                    </div>
                </div>
            </div>

            <!-- Support Section -->
            <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Need Help?</h3>
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div class="flex items-center gap-6">
                        <div class="p-3 bg-white rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 class="text-lg font-medium text-gray-900 mb-2">Contact Support</h4>
                            <p class="text-gray-600 mb-4">Our support team is available 24/7 to help you with any questions.</p>
                            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
