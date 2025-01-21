<!-- dashboard/+page.svelte -->
<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import OmniBox from '$lib/components/dashboard/OmniBox.svelte';
	import { Chart, Svg, Sankey, Link, Group, Rect, Text, Tooltip } from 'layerchart';
	import type { PageData } from './$types';
	// @ts-ignore
	import { scaleLinear } from 'd3-scale';
	import ArcMetrics from '$lib/components/dashboard/ArcMetrics.svelte';
	import ActionButtons from '$lib/components/dashboard/ActionButtons.svelte';

	export let data: PageData;

	// Loading state
	let loading = true;
	$: {
		if (data) {
			setTimeout(() => {
				loading = false;
			}, 100);
		}
	}

	// Sankey configuration
	const nodeWidth = 8;
	const nodePadding = 20;
	const nodeAlign = "justify";

	// Color scales
	const colorScale = scaleLinear<string>()
		.domain([0, 350])
		.range(['#818CF8', '#F472B6'] as const);

	// Highlight state
	let highlightLinkIndexes: number[] = [];
	let highlightNodeIndexes: number[] = [];

	// Link opacity configuration
	const linkOpacity = {
		default: 0.4,
		inactive: 0.1
	};

	// Node opacity configuration
	const nodeOpacity = {
		default: 0.5,
		hover: 0.7,
		inactive: 0.2
	};

	// Types for Sankey data
	type SankeyLink = {
		index: number;
		source: SankeyNode;
		target: SankeyNode;
		value: number;
		width: number;
	};

	type SankeyNode = {
		id: number;
		name: string;
		value: number;
		x0?: number;
		x1?: number;
		y0?: number;
		y1?: number;
		height?: number;
		sourceLinks?: SankeyLink[];
		targetLinks?: SankeyLink[];
	};

	// Node accessor functions
	const nodeId = (node: SankeyNode) => node.id;
	const nodeLabel = (node: SankeyNode) => node.name;

	// Dimensions
	const padding = { top: 20, right: 0, bottom: 20, left: 0 };

	// Format number with commas
	const formatNumber = (num: number) => num.toLocaleString();

	// Helper function to get node opacity
	const getNodeOpacity = (node: SankeyNode) => {
		if (highlightNodeIndexes.includes(node.id)) return nodeOpacity.hover;
		if (highlightNodeIndexes.length && !highlightNodeIndexes.includes(node.id)) return nodeOpacity.inactive;
		return nodeOpacity.default;
	};

	// Helper function to get link opacity
	const getLinkOpacity = (link: SankeyLink) => {
		if (highlightLinkIndexes.includes(link.index)) return linkOpacity.default;
		if (highlightLinkIndexes.length) return linkOpacity.inactive;
		return linkOpacity.default;
	};
</script>

<style>
	:global(.tooltip-root) {
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(229, 231, 235, 0.8);
		border-radius: 12px;
		padding: 16px;
		min-width: 240px;
		animation: tooltip-fade 0.2s ease-out;
	}

	:global(.tooltip-header) {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(17, 24, 39);
		padding-bottom: 8px;
		border-bottom: 1px solid rgb(229, 231, 235);
		margin-bottom: 8px;
	}

	:global(.tooltip-list) {
		margin-top: 12px;
		display: grid;
		gap: 8px;
	}

	:global(.tooltip-separator) {
		height: 1px;
		background: rgb(229, 231, 235);
		margin: 12px 0;
	}

	:global(.tooltip-item) {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 16px;
		align-items: center;
		font-size: 0.875rem;
	}

	:global(.tooltip-item-label) {
		color: rgb(107, 114, 128);
	}

	:global(.tooltip-item-value) {
		color: rgb(17, 24, 39);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	@keyframes tooltip-fade {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
				</div>
				<div class="flex items-center">
					<form method="POST">
						<Button variant="secondary" type="submit">Sign out</Button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		{#if loading}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Skeleton for Sankey diagram -->
				<div class="bg-white rounded-lg shadow p-6 animate-pulse">
					<div class="h-[400px] bg-gray-200 rounded"></div>
				</div>
				<!-- Skeleton for Arc graph -->
				<div class="bg-white rounded-lg shadow p-6 animate-pulse">
					<div class="h-[400px] bg-gray-200 rounded"></div>
				</div>
			</div>
			<!-- Skeleton for OmniBox -->
			<div class="mt-6 bg-white rounded-lg shadow p-6 animate-pulse">
				<div class="h-[400px] bg-gray-200 rounded"></div>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Sankey Diagram -->
				<div class="bg-white rounded-xl shadow-md p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Ticket Flow</h2>
					<div class="h-[500px]">
						<Chart
							data={data.ticketFlow}
							{padding}
							let:tooltip
							let:width
							let:height
						>
							<Svg {width} {height}>
								<Sankey
									{nodeAlign}
									{nodePadding}
									{nodeWidth}
									{nodeId}
									let:links
									let:nodes
								>
									{#each links as link}
										<Link
											sankey
											data={link}
											stroke={colorScale(link.source.value)}
											stroke-opacity={getLinkOpacity(link)}
											stroke-width={link.width}
											class="transition-[stroke-opacity] duration-300"
											on:pointerover={() => {
												highlightLinkIndexes = [link.index];
												highlightNodeIndexes = [link.source.id, link.target.id];
											}}
											on:pointermove={(e) => tooltip.show(e, { link })}
											on:pointerleave={() => {
												highlightLinkIndexes = [];
												highlightNodeIndexes = [];
												tooltip.hide();
											}}
											tweened
										/>
									{/each}

									{#each nodes as node}
										{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
										{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
										<Group x={node.x0} y={node.y0} tweened>
											<Rect
												width={nodeWidth}
												height={nodeHeight}
												fill={colorScale(node.value)}
												fillOpacity={getNodeOpacity(node)}
												class="transition-[fill-opacity] duration-300"
												on:pointerover={() => {
													highlightNodeIndexes = [node.id];
													highlightLinkIndexes = [
														...(node.sourceLinks?.map((l: SankeyLink) => l.index) ?? []),
														...(node.targetLinks?.map((l: SankeyLink) => l.index) ?? [])
													];
												}}
												on:pointermove={(e) => tooltip.show(e, { node })}
												on:pointerleave={() => {
													highlightNodeIndexes = [];
													highlightLinkIndexes = [];
													tooltip.hide();
												}}
												tweened
											/>
											<Text
												value={nodeLabel(node)}
												x={node.height === 0 ? -4 : nodeWidth + 4}
												y={nodeHeight / 2}
												textAnchor={node.height === 0 ? "end" : "start"}
												verticalAnchor="middle"
												class="pointer-events-none text-sm fill-gray-700 font-bold"
											/>
										</Group>
									{/each}
								</Sankey>
							</Svg>

							<Tooltip.Root let:data class="tooltip-root">
								<Tooltip.Header class="tooltip-header">
									{#if data.node}
										{data.node.name}
									{:else if data.link}
										{data.link.source.name}
										<span class="text-gray-400 mx-1">→</span>
										{data.link.target.name}
									{/if}
								</Tooltip.Header>

								<Tooltip.List class="tooltip-list">
									{#if data.node}
										<Tooltip.Item
											label="Total"
											value={formatNumber(data.node.value)}
											class="tooltip-item"
											labelClass="tooltip-item-label"
											valueClass="tooltip-item-value"
										/>

										{#if data.node.targetLinks?.length}
											<Tooltip.Separator class="tooltip-separator" />
											<div class="text-sm font-medium text-gray-700">Sources</div>
											{#each data.node.targetLinks as link}
												<Tooltip.Item
													label={link.source.name}
													value={formatNumber(link.value)}
													class="tooltip-item"
													labelClass="tooltip-item-label"
													valueClass="tooltip-item-value"
												/>
											{/each}
										{/if}

										{#if data.node.sourceLinks?.length}
											<Tooltip.Separator class="tooltip-separator" />
											<div class="text-sm font-medium text-gray-700">Targets</div>
											{#each data.node.sourceLinks as link}
												<Tooltip.Item
													label={link.target.name}
													value={formatNumber(link.value)}
													class="tooltip-item"
													labelClass="tooltip-item-label"
													valueClass="tooltip-item-value"
												/>
											{/each}
										{/if}
									{:else if data.link}
										<Tooltip.Item
											label="Value"
											value={formatNumber(data.link.value)}
											class="tooltip-item"
											labelClass="tooltip-item-label"
											valueClass="tooltip-item-value"
										/>
									{/if}
								</Tooltip.List>
							</Tooltip.Root>
						</Chart>
					</div>
				</div>

				<div class="flex flex-col gap-6">
					<ArcMetrics />
					<ActionButtons />
				</div>
			</div>

			<!-- OmniBox -->
			<div class="mt-6">
				<OmniBox tickets={data.tickets} />
			</div>
		{/if}
	</main>
</div>