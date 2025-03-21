<script>
    import { isAuthenticated, user } from "$lib/store";
    import { onMount } from "svelte";
    import { getUserData } from "$lib/api";

    onMount(async () => {
        if ($isAuthenticated) {
            const result = await getUserData();
            if (result.success) {
                $user = result.data;
            }
        }
    });
</script>

<div class="home-container">
    <div class="content">
        <h1>Parkolóház</h1>
        <p>Üdvözöljük a Parkolóház Rendszerben!</p>
        {#if !$isAuthenticated}
            <p>
                Kérjük, jelentkezzen be a parkolóház funkcióinak használatához.
            </p>
            <div class="buttons">
                <a href="/login" class="button primary">Bejelentkezés</a>
                <a href="/register" class="button secondary">Regisztráció</a>
            </div>
        {:else}
            <p>
                Üdvözöljük, {$user?.firstName} {$user?.lastName}!
            </p>
            <p>
                Használja a fenti menüt a navigációhoz.
            </p>
            <div class="buttons">
                <a href="/dashboard" class="button primary">Parkolás kezelése</a>
                <a href="/cars" class="button secondary">Autóim</a>
            </div>
        {/if}
    </div>
    <div class="image-container">
        <img src="/images/parking_garage_main.jpg" alt="Parkolóház" />
    </div>
</div>

<style>
    .home-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem;
        min-height: 70vh;
    }

    .content {
        flex: 1;
        max-width: 600px;
        padding-right: 2rem;
    }

    h1 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    p {
        color: #34495e;
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    .buttons {
        display: flex;
        gap: 1rem;
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
        background-color: #2ecc71;
        color: white;
    }

    .secondary:hover {
        background-color: #27ae60;
    }

    .image-container {
        flex: 1;
        max-width: 500px;
    }

    img {
        width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
</style>
