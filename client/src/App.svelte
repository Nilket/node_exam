<script>
import { Router, Route } from 'svelte-routing';
import { Toaster } from 'svelte-sonner';
import { checkAuth } from './stores/userStore.js';
import { onMount } from 'svelte';
import NavBar from './components/Nav/NavBar.svelte';
import Login from './components/Login/Login.svelte';
import Home from './pages/Home/Home.svelte';
import PrivateRoute from './components/PrivateRoutes/PrivateRoute.svelte';
import Register from './components/Register/Register.svelte';
  
onMount(() =>{
    checkAuth();
});

</script>

<Toaster />
<Router>
    <NavBar />
    <Route path="/login"><Login /></Route>
    <Route path="/register"><Register /></Route>
    <PrivateRoute Component={Home} />
</Router>