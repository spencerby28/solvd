<script lang="ts">
    import CustomArc from './CustomArc.svelte';
    
    // Mock data - in real app would come from props/store
    const metrics = {
        aiHandling: 72,        // % of tickets handled by AI
        avgResponse: 85,       // % within target response time
        satisfaction: 92,      // % customer satisfaction
        resolution: 88,        // % resolved within SLA
        escalation: 15,        // % requiring escalation
        handledTotal: 95       // % of total ticket capacity handled
    };
</script>


<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <CustomArc
        value={metrics.aiHandling}
        title="AI Handling Rate"
        gradientFrom="indigo-400"
        gradientTo="indigo-600"
    />

    <CustomArc
        value={metrics.avgResponse}
        title="Response Time Target"
        gradientFrom="emerald-400"
        gradientTo="emerald-600"
    />

    <CustomArc
        value={metrics.satisfaction}
        title="Customer Satisfaction"
        gradientFrom="sky-400"
        gradientTo="sky-600"
    />

    <CustomArc
        value={metrics.resolution}
        title="SLA Resolution Rate"
        gradientFrom="amber-400"
        gradientTo="amber-600"
    />

    <CustomArc
        value={metrics.escalation}
        title="Escalation Rate"
        gradientFrom="rose-400"
        gradientTo="rose-600"
    />

    <CustomArc
        value={metrics.handledTotal}
        title="Capacity Utilization"
        gradientFrom="purple-400"
        gradientTo="purple-600"
    />
</div>