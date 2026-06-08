<script>
    import { fetchGet, fetchPut } from '../../util/fetchUtil.js';
    import { navigate } from 'svelte-routing';
    import { toast } from 'svelte-sonner';
    import { user } from '../../stores/userStore.js';

    let profile = $state(null);

    let username = $state('');
    let email = $state('');
    let first_name = $state('');
    let last_name = $state('');
    let password = $state('');
    let confirmPassword = $state('');

    async function loadProfile() {
        try {
            const data = await fetchGet(`/api/users/${$user.username}`);
            profile = data.user;
            username = data.user.username;
            email = data.user.email;
            first_name = data.user.first_name;
            last_name = data.user.last_name;
        } catch (e) {
            toast.error('Could not load profile!');
        }
    }

    async function handleSubmit() {
        if (password && password !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        try {
            const body = { username, email, first_name, last_name };
            if (password) body.password = password;

            await fetchPut('/api/users/update', body);
            user.update((u) => ({ ...u, username, email }));
            toast.success('Profile updated!');
            navigate(`/users/${username}`);
        } catch (e) {
            toast.error(e.message || 'Could not update profile!');
        }
    }

    $effect(() => {
        loadProfile();
    });
</script>

<main class="form-main">
    <div class="form-card">
        <a class="back-btn" href="/users/{$user.username}">Back</a>
        <p class="title">Edit profile</p>

        <div class="row">
            <div class="field">
                <label for="first_name">First name</label>
                <input
                    type="text"
                    id="first_name"
                    bind:value={first_name}
                />
            </div>

            <div class="field">
                <label for="last_name">Last name</label>
                <input
                    type="text"
                    id="last_name"
                    bind:value={last_name}
                />
            </div>
        </div>

        <div class="field">
            <label for="username">Username</label>
            <input
                type="text"
                id="username"
                bind:value={username}
            />
        </div>

        <div class="field">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                bind:value={email}
            />
        </div>

        <div class="field">
            <label for="password">New password</label>
            <input
                type="password"
                id="password"
                placeholder="Leave blank to keep current"
                bind:value={password}
            />
        </div>

        <div class="field">
            <label for="confirmPassword">Confirm new password</label>
            <input
                type="password"
                id="confirmPassword"
                bind:value={confirmPassword}
            />
        </div>

        <button onclick={handleSubmit}>Save changes</button>
    </div>
</main>