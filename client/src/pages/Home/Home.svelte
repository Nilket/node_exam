<script>
    import { user } from '../../stores/userStore.js';
    import { fetchGet, fetchPost } from '../../util/fetchUtil.js';
    import { socket } from '../../stores/socketStore.js';
    import { onMount, onDestroy } from 'svelte';
    import { navigate } from 'svelte-routing';

    let posts = $state([]);
    let selectedCategory = $state('');

    const categories = ['Vulnerabilities', 'Threat Intel', 'Tools', 'News', 'CTF'];

    async function fetchPosts() {
        try{
        const endpoint = selectedCategory
        ? `/api/posts?category=${selectedCategory}`
        :'/api/posts';
        const data = await fetchGet(endpoint);
        posts = data?.posts ?? [];
        } catch (error){ 
            console.log('Fetchposts fejl:', error.message);
        }
    }

    async function toggleLike(postId){
        await fetchPost(`/api/posts/${postId}/like`, {});
    }

    function onLikeUpdated({postId, like_count}) {
        posts = posts.map(p=> p.id === postId ? {...p, like_count } : p);
    }

    onMount(() =>{
        fetchPosts();
        socket.on('like_updated', onLikeUpdated);
    });

    onDestroy(() =>{
        socket.off('like_updated', onLikeUpdated);
    });
</script>

<main class="home-main">
<div class="home-header">
    <h1>Welcome back, {$user?.username}</h1>
</div>

<nav class="category-filter">
    <button class:active={selectedCategory === ''}
    onclick={() => {selectedCategory = ''; fetchPosts(); }}>
    All
    </button>
    
    {#each categories as cat}
    <button class:active={selectedCategory === cat}
    onclick={() => {selectedCategory = cat; fetchPosts(); }}>
    {cat}
    </button>
    {/each}
</nav>

<section class="post-list">
    {#if posts.length === 0}
        <p class="empty-posts">No posts yet - be the first to share something!</p>
    {:else}
    {#each posts as post (post.id)}
        <article class="post-card">
            <a class="post-link" href="/posts/{post.id}">
            <div class="post-meta">
                {#if post.category}
                <span class="category-tag">{post.category}</span>
                {/if}
                <span class="author">by {post.username}</span>
                <span class="date">{new Date(post.created_at).toLocaleDateString('da-DK')}</span>
            </div>

            <h2>{post.title}</h2>
            <p class="preview">{post.content.slice(0,200)}{post.content.length > 200 ? '...' : ''}</p>
            </a>
            <footer class="post-footer">
                <button class="like-btn"
                onclick={(e) => { e.stopPropagation(); toggleLike(post.id); }}>
                ♥ {post.like_count}
                </button>

                <span class="comment-count">💬 {post.comment_count}</span>
            </footer>
        </article>
        {/each}
        {/if}
</section>
</main>