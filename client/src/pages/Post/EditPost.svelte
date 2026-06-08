<script>
    import { navigate } from 'svelte-routing';
    import { toast } from 'svelte-sonner';
    import { fetchGet, fetchPut } from '../../util/fetchUtil.js';

    let { id } = $props();

    let title = $state('');
    let content = $state('');
    let category = $state('');

    const categories = [
        'Vulnerabilities',
        'Threat Intel',
        'Tools',
        'News',
        'CTF',
    ];

    async function loadPost() {
        try {
            const data = await fetchGet(`/api/posts/${id}`);
            title = data.post.title;
            content = data.post.content;
            category = data.post.category ?? '';
        } catch (e) {
            toast.error('Could not load post!');
        }
    }

    async function handleSubmit() {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and text content is required!');
            return;
        }

        try {
            await fetchPut(`/api/posts/${id}`, { title, content, category });
            toast.success('Post updated!');
            navigate(`/posts/${id}`);
        } catch (error) {
            toast.error(error.message || 'An error occured during updating.');
        }
    }

    $effect(() => {
        loadPost();
    });
</script>

<main class="form-main">
    <div class="form-card">
        <a class="back-btn" href="/posts/{id}">Back</a>
        <p class="title">Edit post</p>

        <div class="field">
            <label for="category">Category</label>
            <select id="category" bind:value={category}>
                <option value="">Select a category</option>
                {#each categories as ctgory}
                    <option value={ctgory}>{ctgory}</option>
                {/each}
            </select>
        </div>

        <div class="field">
            <label for="title">Title</label>
            <input
                type="text"
                id="title"
                placeholder="What is your post about?"
                bind:value={title}
                maxlength="255"
            />
        </div>

        <div class="field">
            <label for="content">Content</label>
            <textarea
                id="content"
                placeholder="Share your knowledge..."
                bind:value={content}
                rows="8"
            ></textarea>
        </div>

        <button onclick={handleSubmit}>Save changes</button>
    </div>
</main>