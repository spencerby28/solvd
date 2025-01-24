<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center border-2 border-red-500">
  <div class="text-center">
    <h1 class="text-[20vh] font-bold text-gray-800">{$page.status}</h1>
    <p class="text-3xl font-medium text-gray-600 mt-4">{$page.error?.message || 'Page not found'}</p>
    <button 
      class="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      on:click={() => goto('/')}>
      Return 
    </button>
  </div>
</div>

