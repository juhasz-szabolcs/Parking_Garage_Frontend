<script>
    import { onMount } from "svelte";
    import { user, isAuthenticated } from "$lib/store";
    import { goto } from "$app/navigation";

    let users = [];
    let loading = true;
    let error = "";
    let success = "";

    onMount(async () => {
        if (!$isAuthenticated || !$user || !$user.isAdmin) {
            console.log('User not authenticated or not admin, redirecting to home');
            goto("/");
            return;
        }
        await loadUsers();
    });

    async function loadUsers() {
        loading = true;
        error = "";

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            users = result;
            console.log("Loaded users:", users);
        } catch (error) {
            console.error("Error loading users:", error);
            error = "Hiba történt a felhasználók betöltése során";
        } finally {
            loading = false;
        }
    }
</script>

<div class="container">
    <h1>Felhasználók</h1>

    {#if error}
        <div class="alert alert-danger" role="alert">
            {error}
        </div>
    {/if}

    {#if success}
        <div class="alert alert-success" role="alert">
            {success}
        </div>
    {/if}

    {#if loading}
        <div class="loading">
            <i class="bi bi-arrow-repeat"></i>
            <p>Betöltés...</p>
        </div>
    {:else}
        <div class="users-grid">
            {#each users as user}
                <div class="user-card">
                    <div class="user-header">
                        <h3>{user.firstName} {user.lastName}</h3>
                        {#if user.isAdmin}
                            <span class="admin-badge">Admin</span>
                        {/if}
                    </div>
                    <div class="user-details">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Autók száma:</strong> {user.cars?.length || 0}</p>
                        <p><strong>Regisztráció dátuma:</strong> {new Date(user.createdAt).toLocaleDateString('hu-HU')}</p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        margin-bottom: 2rem;
        color: #2c3e50;
    }

    .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .user-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .user-header h3 {
        margin: 0;
        color: #2c3e50;
    }

    .admin-badge {
        background-color: #dc3545;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
    }

    .user-details {
        color: #6c757d;
    }

    .user-details p {
        margin: 0.5rem 0;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .loading i {
        font-size: 2rem;
        color: #3498db;
        margin-bottom: 1rem;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }

    .alert {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .alert-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .alert-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
</style> 