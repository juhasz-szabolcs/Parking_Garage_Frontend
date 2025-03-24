<script>
    import { page } from '$app/stores';
    import { user, isAuthenticated } from '$lib/store';
    import { goto } from '$app/navigation';
    import { logout } from '$lib/api';
    import 'bootstrap-icons/font/bootstrap-icons.css';
    import Nav from "$lib/components/Nav.svelte";

    async function handleLogout() {
        try {
            await logout();
            $user = null;
            $isAuthenticated = false;
            goto('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
</script>

<nav class="navbar">
    <div class="nav-brand">
        <a href="/" class="brand-link">
            <i class="bi bi-p-square-fill"></i>
            <span>Parking Garage</span>
        </a>
    </div>

    <div class="nav-links">
        {#if $isAuthenticated}
            <a href="/" class="nav-link {$page.url.pathname === '/' ? 'active' : ''}">
                <i class="bi bi-house-door"></i>
                <span>Főoldal</span>
            </a>
            <a href="/cars" class="nav-link {$page.url.pathname === '/cars' ? 'active' : ''}">
                <i class="bi bi-car-front"></i>
                <span>Autók</span>
            </a>
            <a href="/parking" class="nav-link {$page.url.pathname === '/parking' ? 'active' : ''}">
                <i class="bi bi-p-square"></i>
                <span>Parkoló</span>
            </a>
            <a href="/profile" class="nav-link {$page.url.pathname === '/profile' ? 'active' : ''}">
                <i class="bi bi-person-circle"></i>
                <span>Profil</span>
            </a>
        {:else}
            <a href="/login" class="nav-link {$page.url.pathname === '/login' ? 'active' : ''}">
                <i class="bi bi-box-arrow-in-right"></i>
                <span>Bejelentkezés</span>
            </a>
            <a href="/register" class="nav-link {$page.url.pathname === '/register' ? 'active' : ''}">
                <i class="bi bi-person-plus"></i>
                <span>Regisztráció</span>
            </a>
        {/if}
    </div>

    {#if $isAuthenticated}
        <div class="user-section">
            <span class="user-name">
                {$user?.firstName} {$user?.lastName}
            </span>
            <button class="logout-button" on:click={handleLogout}>
                Kijelentkezés
            </button>
        </div>
    {/if}
</nav>

<main>
    <slot />
</main>

<footer>
    <p>Parkolóház &copy; {new Date().getFullYear()}</p>
</footer>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
    }

    .navbar {
        background-color: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .nav-brand {
        display: flex;
        align-items: center;
    }

    .brand-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .nav-links {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }

    .nav-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #2c3e50;
        font-weight: 500;
        padding: 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    .nav-link:hover {
        color: #3498db;
        background-color: #f8f9fa;
    }

    .nav-link.active {
        color: #3498db;
        background-color: #e3f2fd;
    }

    .user-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-name {
        color: #2c3e50;
        font-weight: 500;
    }

    .logout-button {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s;
    }

    .logout-button:hover {
        background-color: #c0392b;
    }

    .nav-link i {
        margin-right: 0.5rem;
        font-size: 1.2rem;
    }

    .brand-link i {
        margin-right: 0.5rem;
        font-size: 1.5rem;
        color: #3498db;
    }

    .nav-link:hover i,
    .brand-link:hover i {
        color: #3498db;
    }

    .nav-link.active i {
        color: #3498db;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        min-height: calc(100vh - 150px);
    }

    footer {
        text-align: center;
        padding: 1rem;
        background-color: #2c3e50;
        color: white;
    }
</style>
