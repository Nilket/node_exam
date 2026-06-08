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
    import CreatePost from './pages/Post/CreatePost.svelte';
    import PostDetail from './pages/Post/PostDetail.svelte';
    import EditPost from './pages/Post/EditPost.svelte';
    import Profile from './pages/Profile/Profile.svelte';

    onMount(() => {
        checkAuth();
    });
</script>

<Toaster />
<Router>
    <NavBar />
    <Route path="/login"><Login /></Route>
    <Route path="/register"><Register /></Route>

    <Route path="/posts/new">
        <PrivateRoute Component={CreatePost} />
    </Route>

    <Route path="/posts/:id/edit" let:params>
        <PrivateRoute Component={EditPost} id={params.id} />
    </Route>

    <Route path="/posts/:id" let:params>
        <PrivateRoute Component={PostDetail} id={params.id} />
    </Route>

    <Route path="/users/:username" let:params>
        <PrivateRoute Component={Profile} username={params.username} />
    </Route>

    <Route>
        <PrivateRoute Component={Home} />
    </Route>
</Router>
