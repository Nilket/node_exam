<script>
    import { user } from '../../stores/userStore.js';
    import { navigate, Link } from 'svelte-routing';
    import { toast } from "svelte-sonner";
    import { fetchPost } from '../../util/fetchUtil.js';


    let title = $state("");
    let content = $state("");
    let category = $state("");

    const categories = ['Vulnerabilities', 'Threat Intel', 'Tools', 'News', 'CTF'];

    async function handleSubmit() {
        if(!title.trim() || !content.trim()) {
            toast.error("Title and text content is required!");
            return;
        }

        try {
            const data = await fetchPost('/api/posts', {title, content, category});
            toast.success("Post published!");
            navigate(`/posts/${data.id}`);
        } catch (error){
            toast.error(error.message || "An error occured during posting.");
        }
    }

</script>

<main class="form-main">
    <div class="form-card">
        <p class="title">Create a post!</p>

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
            <input type="text"
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

        <button onclick={handleSubmit}>Publish post</button>

        <p class="footer">
            Changed your mind? <Link to="/">Go back Home</Link>
        </p>

    </div>


</main>