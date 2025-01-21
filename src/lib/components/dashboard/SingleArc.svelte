<script lang="ts">
    import { Chart, Svg, Arc, Text, Group, LinearGradient, PieChart } from 'layerchart';
    import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
    let value = 60;
    let renderContext: 'svg' | 'canvas' = 'svg';
</script>


<Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

<div class="h-[160px] p-4 border rounded">
    <PieChart {renderContext}>
      <svelte:fragment slot="marks">
        <LinearGradient class="from-secondary to-primary" let:gradient>
          <Group y={20}>
            <Arc
              value={70}
              domain={[0, 100]}
              outerRadius={80}
              innerRadius={-15}
              cornerRadius={10}
              padAngle={0.02}
              range={[-120, 120]}
              fill={gradient}
              track={{ class: "fill-none stroke-surface-content/10" }}
              let:value
            >
              <Text
                value={Math.round(value) + "%"}
                textAnchor="middle"
                verticalAnchor="middle"
                class="text-4xl tabular-nums"
              />
            </Arc>
          </Group>
        </LinearGradient>
      </svelte:fragment>
    </PieChart>
  </div>