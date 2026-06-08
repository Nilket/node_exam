<script>
    import { Link, navigate } from 'svelte-routing';
    import { fetchPost } from '../../util/fetchUtil.js';
    import { user } from '../../stores/userStore.js';
    import { toast } from 'svelte-sonner';

    async function handleLogout() {
        try {
            await fetchPost('/auth/logout');
            user.set(null);
            toast('Logged out');
            navigate('/login', { replace: true });
        } catch (e) {
            toast.error('Logout has failed...');
        }
    }
</script>

<nav>
    <Link to={$user ? '/' : '/login'} class="logo">Icarus</Link>

    <div class="links">
        {#if $user}
            <Link to="/users/{$user.username}" class="username"
                >{$user.username}</Link
            >
            <Link to="/posts/new" class="btn-new-post">+</Link>
            <button onclick={handleLogout}>Log out</button>
        {:else}
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        {/if}
    </div>
</nav>
