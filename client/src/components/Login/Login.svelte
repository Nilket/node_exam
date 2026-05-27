<script>
import { navigate, Link } from 'svelte-routing';
import { fetchPost } from '../../util/fetchUtil.js';
import { user, authorized} from '../../stores/userStore.js';
import { toast } from 'svelte-sonner';

let username = $state("");
let password = $state("");

async function handleLogin(){
    if(!username || !password) {
        toast.error("Please fill in all the fields");
        return;
    }

    try{
        const data = await fetchPost("/auth/login", { username, password});
        user.set(data.user);
        toast.success("Welcome back!");
        navigate("/", {replace: true});
    } catch (e){
        toast.error(e.message || "Login failed");
    }
}

$effect(() => {
    if($authorized && $user){
        navigate("/", {replace: true});
    }
});

</script>

<main class="login-main">
    <div class="login-card">
        <h1>Whisper</h1>
        <p class="login-title">Sign in to your account</p>

        <div class="field">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Enter your username..." bind:value={username}>
        </div>

        <div class="field">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" bind:value={password} onkeydown={(e) => e.key === "Enter" && handleLogin()}>
        </div>

        <button onclick={handleLogin}>Sign in</button>

        <p class="footer">
            No account? <Link to="/register">Register here</Link>
        </p>
    </div>

</main>