<script>
import { Link, navigate } from 'svelte-routing';
import { fetchPost } from '../../util/fetchUtil.js';
import { user } from '../../stores/userStore.js';
import { toast } from "svelte-sonner"

async function handleLogout(){
    try{
        await fetchPost('/auth/logout');
        user.set(null);
        toast("Logged out");
        navigate("/login", {replace: true});
    } catch (e){
        toast.error("Logout has failed...");
    }

}

</script>
<nav>
    <Link to={$user ? "/" : "/login"} class="logo">Whisper</Link>

    <div class="links">
        {#if $user}
        <span class="email">{$user.email}</span>
        <button onclick={handleLogout}>Log out</button>

        {:else}
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {/if}
    </div>
</nav>