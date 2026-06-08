<script>
    import { fetchGet, fetchPost, fetchDelete } from '../../util/fetchUtil.js';
    import { socket } from '../../stores/socketStore.js';
    import { user } from '../../stores/userStore.js';
    import { toast } from 'svelte-sonner';
    import { navigate } from 'svelte-routing';

    let { id } = $props();

    let post = $state(null);
    let comments = $state([]);
    let newComment = $state('');

    async function loadPost() {
        try {
            const data = await fetchGet(`/api/posts/${id}`);
            post = data.post;
        } catch (e) {
            toast.error('Could not load post!');
        }
    }

    async function loadComments() {
        try {
            const data = await fetchGet(`/api/posts/${id}/comments`);
            comments = data.comments;
        } catch (e) {
            toast.error('Could not load comments!');
        }
    }

    async function deleteComment(commentId) {
        try {
            await fetchDelete(`/api/posts/${id}/comments/${commentId}`);
        } catch (e) {
            toast.error(e.message || 'Could not delete comment!');
        }
    }

    async function deletePost() {
        try {
            await fetchDelete(`/api/posts/${id}`);
            navigate('/');
        } catch (e) {
            toast.error(e.message || 'Could not delete post!');
        }
    }

    async function toggleLike() {
        await fetchPost(`/api/posts/${post.id}/like`, {});
    }

    async function submitComment() {
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }
        try {
            await fetchPost(`/api/posts/${id}/comments`, {
                content: newComment,
            });
            newComment = '';
        } catch (e) {
            toast.error(e.message || 'Could not post comment');
        }
    }

    function onLikeUpdated({ postId, like_count }) {
        if (post && post.id === postId) {
            post.like_count = like_count;
        }
    }

    function onCommentsUpdated({ postId, comments: updatedComments }) {
        if (Number(id) === postId) {
            comments = updatedComments;
        }
    }

    $effect(() => {
        socket.on('like_updated', onLikeUpdated);
        socket.on('comments_updated', onCommentsUpdated);

        return () => {
            socket.off('like_updated', onLikeUpdated);
            socket.off('comments_updated', onCommentsUpdated);
        };
    });

    $effect(() => {
        loadPost();
        loadComments();
    });
</script>

<main class="post-detail-main">
    {#if post}
        <article class="post-detail-card">
            <a href="/" class="back-btn">Back</a>

            {#if post.user_id === $user.id}
                <button class="post-delete-btn" onclick={() => deletePost()}>Delete</button>
                <button class="post-edit-btn" onclick={() => navigate(`/posts/${id}/edit`)}>Edit</button>
            {/if}

            <div class="detail-meta">
                {#if post.category}
                    <span class="category-tag">{post.category}</span>
                {/if}
                <a href="/users/{post.username}" class="author">by {post.username}</a>
                <span class="date"
                    >{new Date(post.created_at).toLocaleString(
                        'da-DK'
                    )}</span
                >
            </div>

            <h1>{post.title}</h1>
            <p class="detail-content">{post.content}</p>

            <footer class="detail-footer">
                <button class="like-btn" onclick={toggleLike}>
                    ♥ {post.like_count}
                </button>

                <span class="comment-count">💬 {comments.length}</span>
            </footer>
        </article>

        <section class="comments-section">
            <h2>Comments ({comments.length})</h2>

            <div class="comment-form">
                <textarea
                    placeholder="Share your thoughts"
                    bind:value={newComment}
                    rows="3"
                ></textarea>
                <button onclick={submitComment}>Post comment</button>
            </div>

            {#if comments.length === 0}
                <p class="empty-comment">No comments yet</p>
            {:else}
                {#each comments as comment (comment.id)}
                    <div class="comment-card">
                        <div class="comment-meta">
                            <a href="/users/{comment.username}" class="author">{comment.username}</a>
                            <span class="date"
                                >{new Date(
                                    comment.created_at
                                ).toLocaleString('da-DK')}</span
                            >
                            {#if comment.user_id === $user.id}
                                <button
                                    class="delete-btn"
                                    onclick={() => deleteComment(comment.id)}
                                    >Delete</button
                                >
                            {/if}
                        </div>
                        <p>{comment.content}</p>
                    </div>
                {/each}
            {/if}
        </section>
    {:else}
        <p class="empty-post">Post not found</p>
    {/if}
</main>
