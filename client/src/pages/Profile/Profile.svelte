<script>
    import { fetchGet } from '../../util/fetchUtil.js';
    import { navigate, useRouter } from 'svelte-routing';
    import { toast } from 'svelte-sonner';
    import { user } from '../../stores/userStore.js';

    let { username } = $props();

    let profile = $state(null);
    let posts = $state([]);
    let stats = $state(null);

    async function loadProfile() {
        try {
            const data = await fetchGet(`/api/users/${username}`);
            profile = data.user;
            posts = data.posts;
            stats = data.stats;
        } catch (e) {
            toast.error('Could not load profile!');
        }
    }

    $effect(() => {
        loadProfile();
    });
</script>

<main class="profile-main">
    {#if profile}
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">
                    {profile.username[0].toUpperCase()}
                </div>
                <div class="profile-info">
                    <h1>{profile.username}</h1>
                    <span class="profile-name"
                        >{profile.first_name} {profile.last_name}</span
                    >
                    <span class="profile-email">{profile.email}</span>
                </div>
                {#if $user.username === profile.username}
                    <a href="/users/edit" class="edit-profile-btn"
                        >Edit profile</a
                    >
                {/if}
            </div>

            <div class="profile-stats">
                <div class="stat">
                    <span class="stat-value">{stats.post_count}</span>
                    <span class="stat-label">Posts</span>
                </div>
                <div class="stat">
                    <span class="stat-value">{stats.total_likes}</span>
                    <span class="stat-label">Likes</span>
                </div>
                <div class="stat">
                    <span class="stat-value">{stats.total_comments}</span>
                    <span class="stat-label">Comments</span>
                </div>
            </div>
        </div>

        <section class="profile-posts">
            <h2>Posts by {profile.username}</h2>

            {#if posts.length === 0}
                <p class="empty-posts">No posts yet</p>
            {:else}
                {#each posts as post (post.id)}
                    <a href="/posts/{post.id}" class="post-link">
                        <div class="post-card">
                            <div class="post-meta">
                                {#if post.category}
                                    <span class="category-tag"
                                        >{post.category}</span
                                    >
                                {/if}
                                <span class="date">
                                    {new Date(post.created_at).toLocaleString(
                                        'da-DK'
                                    )}
                                </span>
                            </div>
                            <h2>{post.title}</h2>
                            <p class="preview">
                                {post.content.slice(0, 150)}...
                            </p>
                            <div class="post-footer">
                                <span class="like-btn"
                                    >♥ {post.like_count}</span
                                >
                                <span class="comment-count"
                                    >💬 {post.comment_count}</span
                                >
                            </div>
                        </div>
                    </a>
                {/each}
            {/if}
        </section>
    {:else}
        <p class="empty-post">User not found</p>
    {/if}
</main>
