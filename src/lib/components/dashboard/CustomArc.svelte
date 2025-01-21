<script lang="ts">
    import { Chart, Svg, Group, LinearGradient, Arc, Text } from 'layerchart';

    export let value: number;
    export let title: string;
    export let gradientFrom: string;
    export let gradientTo: string;
    export let height: string = "120px";
</script>

<div class="h-[{height}] p-4 border rounded-xl bg-white shadow-md">
    <h3 class="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <Chart>
        <Svg center>
            <Group y={16}>
                <LinearGradient class="from-{gradientFrom} to-{gradientTo}" let:gradient>
                    <Arc
                        {value}
                        range={[-120, 120]}
                        outerRadius={60}
                        innerRadius={50}
                        cornerRadius={5}
                        spring
                        let:value
                        fill={gradient}
                        track={{ class: "fill-none stroke-gray-100" }}
                    >
                        <Text
                            value={Math.round(value) + "%"}
                            textAnchor="middle"
                            verticalAnchor="middle"
                            class="text-3xl font-semibold tabular-nums text-gray-800"
                        />
                    </Arc>
                </LinearGradient>
            </Group>
        </Svg>
    </Chart>
</div>
