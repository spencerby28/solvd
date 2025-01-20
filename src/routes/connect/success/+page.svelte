<script>
    import { page } from '$app/stores';

    const provider = $page.url.searchParams.get('provider') || 'unknown service';
</script>

<h1>Connection Successful!</h1>
<p>Congratulations! Your account has been successfully connected to {provider}.</p>

<a href="/">Return to Dashboard</a>
