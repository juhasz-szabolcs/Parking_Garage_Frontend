<script>
    import { isAuthenticated } from "$lib/store";
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
                Ön be van jelentkezve. Használja a fenti menüt a navigációhoz.
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
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    @media (min-width: 768px) {
        .home-container {
            flex-direction: row;
            justify-content: space-between;
        }

        .content {
            flex: 1;
        }

        .image-container {
            flex: 1;
        }
    }

    .content {
        text-align: center;
    }

    h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #2c3e50;
    }

    p {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
        color: #34495e;
    }

    .buttons {
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

    .image-container {
        max-width: 100%;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    img {
        width: 100%;
        height: auto;
        display: block;
    }
</style>
