<script>
    import { user } from '../../stores/userStore.js';

</script>

<main class="home-main">
    <h1>Welcome back, {$user?.username}</h1>

    <div class="message-box">
        <p class="label">Top secret message</p>
        <p class="encrypted">Gur pnxr vf n yvr. Ohg lbhe frffvba vf erny.</p>
        <p class="hint">Hint: ROT13</p>
    </div>
</main>