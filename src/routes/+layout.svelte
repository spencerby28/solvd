<script>
	import '../app.css'
	import {Toaster} from '$lib/components/ui/sonner'
	import { ModeWatcher } from 'mode-watcher';
	import { setMode } from 'mode-watcher';
	setMode('light');
</script>
<Toaster/>
<ModeWatcher defaultMode="light"/>
<slot/>
