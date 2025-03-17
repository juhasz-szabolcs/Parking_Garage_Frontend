<script>
    import { isAuthenticated, user } from "$lib/store";
    import { logout } from "$lib/api";
    import { goto } from "$app/navigation";

    async function handleLogout() {
        const result = await logout();
        if (result.success) {
            $user = null;
            goto("/");
        }
    }
</script>

<nav>
    <div class="logo">Parkolóház</div>
    <div class="links">
        <a href="/">Főoldal</a>
        {#if $isAuthenticated}
            <a href="/dashboard">Irányítópult</a>
            <a href="/cars">Autóim</a>
            <button on:click={handleLogout}>Kijelentkezés</button>
        {:else}
            <a href="/login">Bejelentkezés</a>
            <a href="/register">Regisztráció</a>
        {/if}
    </div>
</nav>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #2c3e50;
        color: white;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .links {
        display: flex;
        gap: 1rem;
    }

    a,
    button {
        color: white;
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    a:hover,
    button:hover {
        background-color: #34495e;
    }

    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
    }
</style>
