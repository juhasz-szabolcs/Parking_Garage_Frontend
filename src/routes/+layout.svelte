<script>
    import { page } from '$app/stores';
    import { user, isAuthenticated } from '$lib/store';
    import { goto } from '$app/navigation';
    import { logout } from '$lib/api';
    import { onMount } from 'svelte';
    import { getGravatarUrl } from '$lib/utils/gravatar';
    import 'bootstrap-icons/font/bootstrap-icons.css';
    import Nav from "$lib/components/Nav.svelte";

    let isMenuOpen = false;
    let isInitialized = false;
    let navAvatarUrl = null;
    let navAvatarLoadError = false;
    let lastAvatarEmail = '';

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/'];

    // Initialize authentication state
    onMount(() => {
        // Check if we have user data in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                user.set(parsedUser);
                isAuthenticated.set(true);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                user.set(null);
                isAuthenticated.set(false);
            }
        }
        isInitialized = true;
    });

    // Watch for route changes and check authentication
    $: if (isInitialized && $page) {
        if (!publicRoutes.includes($page.url.pathname) && !$isAuthenticated) {
            console.log('Unauthorized access, redirecting to home');
            goto('/');
        }
    }

    async function handleLogout() {
        try {
            await logout();
            $user = null;
            $isAuthenticated = false;
            localStorage.removeItem('user');
            goto('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if the API call fails, we should still log out locally
            $user = null;
            $isAuthenticated = false;
            localStorage.removeItem('user');
            goto('/');
        }
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    async function updateNavAvatar(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || normalizedEmail === lastAvatarEmail) {
            return;
        }

        lastAvatarEmail = normalizedEmail;
        navAvatarLoadError = false;
        navAvatarUrl = getGravatarUrl(normalizedEmail, 48);
    }

    // Bezárjuk a menüt, ha átnavigálunk
    $: if ($page) {
        isMenuOpen = false;
    }

    $: if ($isAuthenticated && $user?.email) {
        updateNavAvatar($user.email);
    } else {
        navAvatarUrl = null;
        navAvatarLoadError = false;
        lastAvatarEmail = '';
    }
</script>

{#if isInitialized}
    <nav class="navbar">
        <div class="nav-brand">
            <a href="/" class="brand-link">
                <i class="bi bi-p-square-fill"></i>
                <span>Parking Garage</span>
            </a>
            <button class="menu-toggle" on:click={toggleMenu} aria-label="Menü">
                <i class="bi bi-list"></i>
            </button>
        </div>

        <div class="nav-content" class:open={isMenuOpen}>
            {#if $isAuthenticated}
                <div class="nav-links">
                    <a href="/" class="nav-link {$page.url.pathname === '/' ? 'active' : ''}" on:click={toggleMenu}>
                        <i class="bi bi-house-door"></i>
                        <span>Főoldal</span>
                    </a>
                    {#if $user.isAdmin}
                        <a href="/admin/cars" class="nav-link {$page.url.pathname === '/admin/cars' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-car-front"></i>
                            <span>Össz autó</span>
                        </a>
                        <a href="/admin/profiles" class="nav-link {$page.url.pathname === '/admin/profiles' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-people"></i>
                            <span>Profilok</span>
                        </a>
                        <a href="/admin/statistics" class="nav-link {$page.url.pathname === '/admin/statistics' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-graph-up"></i>
                            <span>Statisztika</span>
                        </a>
                    {:else}
                        <!-- <a href="/dashboard" class="nav-link {$page.url.pathname === '/dashboard' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-speedometer2"></i>
                            <span>Irányítópult</span>
                        </a> -->
                        <a href="/cars" id="cars-navbarlink" class="nav-link {$page.url.pathname === '/cars' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-car-front"></i>
                            <span>Autóim</span>
                        </a>
                        <a href="/statistics" class="nav-link {$page.url.pathname === '/statistics' ? 'active' : ''}" on:click={toggleMenu}>
                            <i class="bi bi-clock-history"></i>
                            <span>Előzmények</span>
                        </a>
                    {/if}
                    <a href="/parking" class="nav-link {$page.url.pathname === '/parking' ? 'active' : ''}" on:click={toggleMenu}>
                        <i class="bi bi-p-square"></i>
                        <span>Parkoló</span>
                    </a>
                    {#if !$user.isAdmin}
                        <div class="profile-menu">
                            <a href="/profile" class="nav-link profile-link {$page.url.pathname === '/profile' ? 'active' : ''}" on:click={toggleMenu}>
                                {#if navAvatarUrl && !navAvatarLoadError}
                                    <img
                                        src={navAvatarUrl}
                                        alt="Profilkep"
                                        class="nav-avatar"
                                        on:error={() => (navAvatarLoadError = true)}
                                    />
                                {:else}
                                    <i class="bi bi-person-circle"></i>
                                {/if}
                                <span>Profil</span>
                            </a>
                            <button class="profile-menu-toggle" aria-label="Profil menü">
                                <i class="bi bi-caret-down-fill"></i>
                            </button>
                            <div class="profile-dropdown">
                                <button class="dropdown-logout-button" on:click={handleLogout}>
                                    <i class="bi bi-box-arrow-right"></i>
                                    <span>Kijelentkezés</span>
                                </button>
                            </div>
                        </div>
                    {/if}
                    <div class="nav-divider"></div>
                    <div class="user-info">
                        <span class="user-name">
                            {$user?.firstName} {$user?.lastName}
                            {#if $user.isAdmin}
                                <span class="admin-badge">Admin</span>
                            {/if}
                        </span>
                    </div>
                    {#if $user.isAdmin}
                        <button class="nav-button logout-button" on:click={handleLogout}>
                            <i class="bi bi-box-arrow-right"></i>
                            <span>Kijelentkezés</span>
                        </button>
                    {/if}
                </div>
            {:else}
                <div class="nav-links">
                    <a href="/login" id="login-link" class="nav-link {$page.url.pathname === '/login' ? 'active' : ''}" on:click={toggleMenu}>
                        <i class="bi bi-box-arrow-in-right"></i>
                        <span>Bejelentkezés</span>
                    </a>
                    <a href="/register" id="register-link" class="nav-link {$page.url.pathname === '/register' ? 'active' : ''}" on:click={toggleMenu}>
                        <i class="bi bi-person-plus"></i>
                        <span>Regisztráció</span>
                    </a>
                </div>
            {/if}
        </div>
    </nav>

    <main>
        <slot />
    </main>

    <footer>
        <p>Parkolóház &copy; {new Date().getFullYear()}</p>
    </footer>
{:else}
    <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Betöltés...</p>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        min-height: 100vh;
    }

    .navbar {
        background-color: white;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
    }

    .nav-brand {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e9ecef;
    }

    .brand-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #2c3e50;
        font-size: 1.25rem;
        font-weight: bold;
    }

    .menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #2c3e50;
        cursor: pointer;
        padding: 0.5rem;
        margin: -0.5rem;
        width: 44px;
        height: 44px;
        align-items: center;
        justify-content: center;
    }

    .nav-content {
        display: flex;
        align-items: center;
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem;
    }

    .nav-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #2c3e50;
        font-weight: 500;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        transition: all 0.3s ease;
        width: 100%;
    }

    .nav-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .nav-link:hover,
    .nav-button:hover {
        color: #3498db;
        background-color: #f8f9fa;
    }

    .nav-link.active {
        color: #3498db;
        background-color: #e3f2fd;
    }

    .nav-divider {
        height: 1px;
        background-color: #e9ecef;
        margin: 0.5rem 0;
        width: 100%;
    }

    .user-info {
        padding: 0.75rem 1rem;
        color: #2c3e50;
        font-weight: 500;
    }

    .logout-button {
        color: #e74c3c;
    }

    .logout-button:hover {
        color: #c0392b;
        background-color: #fee2e2;
    }

    .nav-link i,
    .nav-button i {
        margin-right: 0.75rem;
        font-size: 1.2rem;
        width: 1.5rem;
        text-align: center;
    }

    .brand-link i {
        margin-right: 0.5rem;
        font-size: 1.5rem;
        color: #3498db;
    }

    .nav-avatar {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 0.75rem;
        border: 1px solid #dee2e6;
        flex-shrink: 0;
    }

    .profile-menu {
        position: relative;
        display: flex;
        align-items: stretch;
    }

    .profile-link {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .profile-menu-toggle {
        border: none;
        background: transparent;
        color: #2c3e50;
        padding: 0 0.7rem;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
    }

    .profile-menu-toggle:hover {
        color: #3498db;
        background-color: #f8f9fa;
    }

    .profile-dropdown {
        position: absolute;
        top: calc(100% + 0.4rem);
        right: 0;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        min-width: 150px;
        padding: 0.35rem;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-4px);
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        z-index: 1200;
    }

    .profile-menu:hover .profile-dropdown,
    .profile-menu:focus-within .profile-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .dropdown-logout-button {
        width: 100%;
        border: none;
        background: transparent;
        color: #e74c3c;
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: 6px;
        padding: 0.45rem 0.6rem;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        cursor: pointer;
    }

    .dropdown-logout-button i {
        margin-right: 0;
        font-size: 0.95rem;
        width: auto;
    }

    .dropdown-logout-button:hover {
        color: #c0392b;
        background-color: #fee2e2;
    }

    @media (max-width: 768px) {
        .menu-toggle {
            display: flex;
        }

        .nav-content {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .nav-content.open {
            display: flex;
        }

        .nav-links {
            flex-direction: column;
            width: 100%;
            padding: 0.5rem;
        }

        .nav-link {
            padding: 1rem;
        }

        .profile-menu {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr auto;
        }

        .profile-dropdown {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            border: none;
            padding: 0;
            margin-top: 0.25rem;
            grid-column: 1 / -1;
        }
    }

    @media (min-width: 769px) {
        .navbar {
            padding: 0 1rem;
        }

        .nav-brand {
            border-bottom: none;
            padding: 0.75rem 0;
        }

        .nav-content {
            margin-left: 2rem;
        }

        .nav-links {
            gap: 0.5rem;
        }

        .nav-link,
        .nav-button {
            width: auto;
        }

        .nav-divider,
        .user-info {
            display: none;
        }

        .logout-button {
            background-color: #e74c3c;
            color: white;
            padding: 0.5rem 1rem;
            margin-left: 1rem;
        }

        .logout-button:hover {
            background-color: #c0392b;
            color: white;
        }
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        min-height: calc(100vh - 150px);
    }

    @media (max-width: 768px) {
        main {
            padding: 1rem 0.5rem;
        }
    }

    footer {
        text-align: center;
        padding: 1rem;
        background-color: #2c3e50;
        color: white;
    }

    .loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        gap: 1rem;
    }

    .loading i {
        font-size: 2rem;
        color: #3498db;
    }

    .loading p {
        color: #2c3e50;
        font-size: 1.1rem;
    }

    .admin-badge {
        background-color: #dc3545;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-left: 0.5rem;
    }
</style>
