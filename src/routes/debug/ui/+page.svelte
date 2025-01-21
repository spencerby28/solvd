<script lang="ts">
    import { Chart, Svg, Arc, Tooltip, Text } from 'layerchart';
    import { cubicInOut } from 'svelte/easing';
    import { Button } from 'svelte-ux';
    let show = false;
    import SingleArc from '$lib/components/dashboard/SingleArc.svelte';
</script>

<button on:click={() => (show = !show)}>Toggle</button>

<div class="h-[200px] p-4 border rounded">
    <Chart tooltip={{ mode: 'bisect-x' }}>
      <Svg center>
        {#if show}
          <Arc
            initialValue={0}
            value={60}
            outerRadius={-50}
            innerRadius={-20}
            cornerRadius={10}
            class="fill-cyan-400"
            track={{ class: "fill-cyan-500/10" }}
            tweened={{ duration: 1000, easing: cubicInOut }}
          />
          <Arc
            initialValue={0}
            value={80}
            outerRadius={-50}
            innerRadius={-20}
            cornerRadius={10}
            class="fill-cyan-400"
            track={{ class: "fill-cyan-500/10" }}
            tweened={{ duration: 1000, easing: cubicInOut }}
          >
            <Text
              value={Math.round(80) + '%'} 
              textAnchor="middle"
              verticalAnchor="middle"
              class="text-xl font-semibold text-white"
            />
          </Arc>
        {/if}
      </Svg>
      <Tooltip.Root let:data>
        <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 bg-surface-content text-surface-100 px-4 py-2 text-xs rounded shadow">
          <div class="col-span-2 justify-self-center text-sm font-semibold">
            Tue, March 30
          </div>
          <div class="text-surface-100/50 justify-self-end">Actual:</div>
          <div class="justify-self-end">123.50</div>
          <div class="text-surface-100/50 justify-self-end">Target:</div>
          <div class="justify-self-end">90.00</div>
          <div class="text-surface-100/50 justify-self-end">Variance:</div>
          <div class="justify-self-end">33.50</div>
        </div>
      </Tooltip.Root>
    </Chart>
</div>

<SingleArc />
<Chart>
    <Text value={60} />
</Chart>