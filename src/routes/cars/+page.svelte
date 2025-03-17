<script>
    import { onMount } from "svelte";
    import { getUserData } from "$lib/api";
    import { isAuthenticated } from "$lib/store";
    import { goto } from "$app/navigation";

    let cars = [];
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
            cars = result.data.cars || [];
        } else {
            error =
                typeof result.error === "string"
                    ? result.error
                    : "Nem sikerült betölteni az autókat.";
        }
    });

    function addCar() {
        // Autó hozzáadásának implementálása a jövőben
        alert("Ez a funkció még fejlesztés alatt áll.");
    }
</script>

<div class="cars-container">
    <div class="header">
        <h1>Autóim</h1>
        <button class="add-button" on:click={addCar}>+ Autó hozzáadása</button>
    </div>

    {#if loading}
        <div class="loading">Autók betöltése...</div>
    {:else if error}
        <div class="error-message">{error}</div>
    {:else if cars.length === 0}
        <div class="empty-state">
            <p>Még nincsenek autói. Adjon hozzá egy autót a kezdéshez!</p>
        </div>
    {:else}
        <div class="cars-grid">
            {#each cars as car}
                <div class="car-card">
                    <div class="car-header">
                        <h3>{car.brand} {car.model}</h3>
                        <span class="license-plate">{car.licensePlate}</span>
                    </div>
                    <div class="car-info">
                        <p>Évjárat: {car.year}</p>
                    </div>
                    <div class="car-actions">
                        <button class="action-button edit">Szerkesztés</button>
                        <button class="action-button park">Parkolás</button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .cars-container {
        max-width: 1000px;
        margin: 0 auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin: 0;
    }

    .add-button {
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 1.5rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .add-button:hover {
        background-color: #219653;
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
</style>
