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
        justify-content: center;
        align-items: center;
        padding: 2rem;
        min-height: 70vh;
        gap: 1rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .content {
        flex: 1;
        max-width: 500px;
        padding-right: 1rem;
    }

    h1 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 2.5rem;
    }

    p {
        color: #34495e;
        margin-bottom: 1.2rem;
        line-height: 1.6;
        font-size: 1.1rem;
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
        transition: all 0.3s ease;
    }

    .primary {
        background-color: #3498db;
        color: white;
    }

    .primary:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
    }

    .secondary {
        background-color: #2ecc71;
        color: white;
    }

    .secondary:hover {
        background-color: #27ae60;
        transform: translateY(-2px);
    }

    .image-container {
        flex: 1;
        max-width: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
    }

    img:hover {
        transform: scale(1.02);
    }

    @media (max-width: 768px) {
        .home-container {
            flex-direction: column;
            padding: 1rem;
            text-align: center;
            gap: 1.5rem;
        }

        .content {
            padding-right: 0;
            max-width: 100%;
        }

        h1 {
            font-size: 2rem;
        }

        .image-container {
            max-width: 100%;
            margin-top: 0;
            order: -1;
        }

        img {
            max-height: 280px;
            object-fit: cover;
        }

        .buttons {
            justify-content: center;
            flex-wrap: wrap;
        }

        .button {
            width: 100%;
            text-align: center;
            margin-bottom: 0.5rem;
        }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
        .home-container {
            padding: 1.5rem;
            gap: 1.5rem;
        }

        .content {
            max-width: 450px;
        }

        .image-container {
            max-width: 500px;
        }
    }

    @media (min-width: 1025px) and (max-width: 1400px) {
        .home-container {
            padding: 2rem;
            gap: 2rem;
        }

        .content {
            max-width: 500px;
        }

        .image-container {
            max-width: 550px;
        }
    }

    @media (min-width: 1401px) {
        .home-container {
            padding: 2.5rem;
            gap: 2.5rem;
        }

        .content {
            max-width: 550px;
        }

        .image-container {
            max-width: 700px;
        }

        h1 {
            font-size: 3rem;
        }

        p {
            font-size: 1.2rem;
        }
    }
</style>
