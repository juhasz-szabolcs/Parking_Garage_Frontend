<script>
    import { onMount } from "svelte";
    import { getUserData } from "$lib/api";
    import { isAuthenticated, user, isInitialized } from "$lib/store";
    import { goto } from "$app/navigation";
    import ParkingMap from "$lib/components/ParkingMap.svelte";
    
    let loading = true;
    let error = "";
    let success = "";
    let isStoreInitialized = false;
    let selectedCarId = null;
    
    // Várjuk meg a store inicializálását
    isInitialized.subscribe(value => {
        isStoreInitialized = value;
    });
    
    onMount(async () => {
        if (!$isAuthenticated || !$user) {
            goto("/login");
            return;
        }
        loading = false;
    });
    
    function handleSpotSelect(event) {
        const spot = event.detail;
        console.log('Selected parking spot:', spot);
        // Itt kezeljük a parkolóhely kiválasztását
    }
</script>

{#if isStoreInitialized}
    {#if loading}
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Parkoló betöltése...</p>
        </div>
    {:else}
        {#if error}
            <div class="error-message">{error}</div>
        {/if}
        
        {#if success}
            <div class="success-message">{success}</div>
        {/if}
        
        <h1>Parkolási Adatok</h1>
        
        <div class="parking-content">
            <ParkingMap 
                on:spotSelect={handleSpotSelect}
                selectedCarId={selectedCarId}
            />
        </div>
    {/if}
{:else}
    <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Betöltés...</p>
    </div>
{/if}

<style>
    /* Egyszerű, tiszta stílusok, amik nem idéznek modális megjelenést */
    h1 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }
    
    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }
    
    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }
    
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
        color: #666;
    }
    
    .loading-spinner i {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #3498db;
    }
    
    .parking-content {
        background-color: #fff;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
    
    @media (max-width: 768px) {
        h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .parking-content {
            padding: 1rem;
            border-radius: 6px;
        }
    }
</style>