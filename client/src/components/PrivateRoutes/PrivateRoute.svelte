<script>
import { navigate } from 'svelte-routing';
import { user, authorized } from '../../stores/userStore.js';

let { Component } = $props();

$effect(() =>{
    if($authorized && !$user){
        navigate("/login", {replace: true});
    }
});

</script>

{#if $authorized && $user}
<Component />
{/if}