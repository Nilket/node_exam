<script>
import { navigate, Link } from "svelte-routing";
import { fetchPost } from "../../util/fetchUtil.js";
import { toast } from "svelte-sonner";


let username = $state("");
let password = $state("");
let email = $state("");
let firstName = $state("");
let lastName = $state("");

async function handleRegister(){
    if(!username || !password || !email || !firstName || !lastName){
        toast.error("Please fill in all the fields");
        return;
    }

    try {
        await fetchPost("/auth/register", {
            username,
            password,
            email,
            first_name: firstName,
            last_name: lastName
        });
        toast.success("Account created, please sign in!");
        navigate("/login", {replace: true});
    } catch (e){
        toast.error(e.message || "Registration failed");
    }
}
</script>

<main class="register-main">
    <div class="register-card">
    <h1>Whisper</h1>
    <p class="title">Create your account</p>

    <div class="row">
      <div class="field">
        <label for="firstName">First name</label>
        <input
          id="firstName"
          type="text"
          placeholder="First name"
          bind:value={firstName}
        />
      </div>

      <div class="field">
        <label for="lastName">Last name</label>
        <input
          id="lastName"
          type="text"
          placeholder="Last name"
          bind:value={lastName}
        />
      </div>
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        bind:value={email}
      />
    </div>

    <div class="field">
      <label for="username">Username</label>
      <input
        id="username"
        type="text"
        placeholder="Username"
        bind:value={username}
      />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="••••••••"
        bind:value={password}
        onkeydown={(e) => e.key === "Enter" && handleRegister()}
      />
    </div>

    <button onclick={handleRegister}>Create account</button>

    <p class="footer">
      Already have an account? <Link to="/login">Sign in</Link>
    </p>

</div>

</main>