<script>
    import { isAuthenticated, user } from "$lib/store";
    import { logout } from "$lib/api";
    import { goto } from "$app/navigation";

    async function handleLogout() {
        try {
            const result = await logout();
            if (result.success) {
                // Clear user data from store
                $user = null;
                $isAuthenticated = false;
                // Clear localStorage
                localStorage.removeItem('user');
                // Redirect to home page
                goto("/");
            } else {
                console.error("Logout failed:", result.error);
            }
        } catch (error) {
            console.error("Error during logout:", error);
            // Even if the API call fails, we should still log out locally
            $user = null;
            $isAuthenticated = false;
            localStorage.removeItem('user');
            goto("/");
        }
    }
</script>

<nav>
    <div class="logo">Parkolóház</div>
    <div class="links">
        <a href="/">Főoldal</a>
        {#if $isAuthenticated}
            <a href="/dashboard">Parkolás kezelése</a>
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
