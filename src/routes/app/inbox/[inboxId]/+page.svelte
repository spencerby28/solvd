
<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    
    $: console.log('Current user:', data.user);
</script>


<div class="p-8">
    <h1 class="text-4xl font-extrabold text-green-600 mb-8">Welcome to Solvd</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Website Chat Integration</h2>
            <p class="text-muted-foreground">Embed our intelligent chat widget directly into your website to provide 24/7 customer support. Customize the look and feel to match your brand.</p>
        </div>

        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Social Media Integration</h2>
            <p class="text-muted-foreground">Connect your Instagram and other social media accounts to manage all customer conversations in one place. Never miss an important message.</p>
        </div>

        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Shopify Integration</h2>
            <p class="text-muted-foreground">Seamlessly integrate with your Shopify store to provide order status updates, product recommendations, and handle customer inquiries automatically.</p>
        </div>

        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Knowledge Base</h2>
            <p class="text-muted-foreground">Build and maintain a comprehensive knowledge base that our AI uses to provide accurate responses to customer questions.</p>
        </div>

        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
            <p class="text-muted-foreground">Get detailed insights into customer interactions, response times, satisfaction rates, and AI performance metrics to optimize your support operations.</p>
        </div>

        <div class="bg-card p-6 rounded-lg shadow-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">AI-Powered Support</h2>
            <p class="text-muted-foreground">Our advanced AI handles routine inquiries automatically while seamlessly escalating complex issues to your human support team when needed.</p>
        </div>
    </div>
</div>
