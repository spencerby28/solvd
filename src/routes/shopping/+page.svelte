<script lang="ts">
	const products = [
		{
			id: 1,
			name: 'Classic White',
			color: '#FFFFFF', 
			price: 29.99,
			description: 'Pure and timeless white shade'
		},
		{
			id: 2,
			name: 'Ocean Blue',
			color: '#1E90FF',
			price: 34.99,
			description: 'Calming deep blue tone'
		},
		{
			id: 3,
			name: 'Forest Green',
			color: '#228B22',
			price: 32.99,
			description: 'Rich natural green hue'
		},
		{
			id: 4,
			name: 'Sunset Orange',
			color: '#FFA500',
			price: 31.99,
			description: 'Warm and vibrant orange'
		},
		{
			id: 5,
			name: 'Royal Purple',
			color: '#800080',
			price: 33.99,
			description: 'Majestic purple shade'
		},
		{
			id: 6,
			name: 'Ruby Red',
			color: '#DC143C',
			price: 35.99,
			description: 'Bold and passionate red'
		},
		{
			id: 7,
			name: 'Sunshine Yellow',
			color: '#FFD700',
			price: 30.99,
			description: 'Bright and cheerful yellow'
		},
		{
			id: 8,
			name: 'Turquoise Dream',
			color: '#40E0D0',
			price: 36.99,
			description: 'Peaceful aqua blend'
		}
	];

	let cart: number[] = [];

	function addToCart(productId: number) {
		cart = [...cart, productId];
	}
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Header -->
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 py-6">
			<div class="flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">Color Shop</h1>
				<div class="flex items-center">
					<div class="relative">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						{#if cart.length > 0}
							<span class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
								{cart.length}
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Product Grid -->
	<main class="max-w-7xl mx-auto px-4 py-12">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			{#each products as product}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<div class="h-48 flex items-center justify-center" style="background-color: {product.color}">
					</div>
					<div class="p-4">
						<h2 class="text-xl font-semibold text-gray-800">{product.name}</h2>
						<p class="text-gray-600 mt-2">{product.description}</p>
						<div class="mt-4 flex justify-between items-center">
							<span class="text-2xl font-bold text-gray-900">${product.price}</span>
							<button
								on:click={() => addToCart(product.id)}
								class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Add to Cart
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>
