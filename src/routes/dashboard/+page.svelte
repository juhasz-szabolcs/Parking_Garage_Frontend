<script>
    import { onMount } from "svelte";
    import { getUserData } from "$lib/api";
    import { user, isAuthenticated } from "$lib/store";
    import { goto } from "$app/navigation";

    let userData = null;
    let loading = true;
    let error = "";

    onMount(async () => {
        if (!$isAuthenticated) {
            goto("/login");
            return;
        }

        const result = await getUserData();
        loading = false;

        if (result.success) {
            userData = result.data;
        } else {
            error =
                typeof result.error === "string"
                    ? result.error
                    : "Nem sikerült betölteni a felhasználói adatokat.";
        }
    });
</script>

<div class="dashboard-container">
    <h1>Parkolás kezelése</h1>

    {#if loading}
        <div class="loading">Adatok betöltése...</div>
    {:else if error}
        <div class="error-message">{error}</div>
    {:else if userData}
        <div class="dashboard-card">
            <h2>Üdvözöljük, {$user?.User || "Felhasználó"}!</h2>
            <p>
                Az irányítópultban megtekintheti és kezelheti parkolóházi
                adatait.
            </p>

            <!-- További irányítópult tartalom -->
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Autók száma</h3>
                    <p class="stat-number">{userData.cars?.length || 0}</p>
                </div>

                <div class="stat-card">
                    <h3>Parkolási idő</h3>
                    <p class="stat-number">0 óra</p>
                </div>

                <div class="stat-card">
                    <h3>Egyenleg</h3>
                    <p class="stat-number">0 Ft</p>
                </div>
            </div>

            <div class="dashboard-actions">
                <a href="/cars" class="button primary">Autóim kezelése</a>
                <a href="/parking" class="button secondary">Parkolás indítása</a
                >
            </div>
        </div>
    {:else}
        <div class="no-data">Nincs elérhető felhasználói adat.</div>
    {/if}
</div>

<style>
    .dashboard-container {
        max-width: 1000px;
        margin: 0 auto;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #2c3e50;
        text-align: center;
    }

    .dashboard-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }

    h2 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    .loading {
        text-align: center;
        font-size: 1.2rem;
        color: #7f8c8d;
        padding: 2rem;
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .no-data {
        text-align: center;
        font-size: 1.2rem;
        color: #7f8c8d;
        padding: 2rem;
    }

    .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .stat-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .stat-card h3 {
        margin-bottom: 0.5rem;
        color: #34495e;
    }

    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #3498db;
    }

    .dashboard-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
        transition: background-color 0.3s;
    }

    .primary {
        background-color: #3498db;
        color: white;
    }

    .primary:hover {
        background-color: #2980b9;
    }

    .secondary {
        background-color: #2c3e50;
        color: white;
    }

    .secondary:hover {
        background-color: #1a252f;
    }
</style>
