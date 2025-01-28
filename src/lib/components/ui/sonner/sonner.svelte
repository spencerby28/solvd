<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";
	type $$Props = SonnerProps;
</script>

<Sonner theme={$mode} class="toaster group" toastOptions={{
	classes: {
		toast: "group toast group-[.toaster]:bg-gray-50 group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-green-600 group-[.toaster]:text-lg group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4",
		description: "group-[.toast]:text-muted-foreground group-[.toast]:text-base", 
		actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
		cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
	}
}} {...$$restProps} />
