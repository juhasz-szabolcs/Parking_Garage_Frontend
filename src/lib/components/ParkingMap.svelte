<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { API_URL } from '$lib/api';
    
    export let onSpotSelect;
    export let selectedCarId;
    
    let parkingSpots = [];
    let loading = true;
    let error = '';
    let activeFloor = '1';
    let selectedSpot = null;
    
    onMount(async () => {
        console.log('ParkingMap mounted with selectedCarId:', selectedCarId);
        await loadParkingSpots();
    });
    
    async function loadParkingSpots() {
        try {
            const response = await axios.get(`${API_URL}/api/parking/spots`, {
                withCredentials: true
            });
            parkingSpots = response.data;
            console.log('Loaded parking spots:', parkingSpots);
            // Inicializáljuk az üres parkolóhelyeket
            if (!parkingSpots || parkingSpots.length === 0) {
                parkingSpots = Array(20).fill(null).map((_, index) => {
                    const row = Math.floor(index / 5);  // 0-3
                    const col = index % 5;              // 0-4
                    const spotNumber = String.fromCharCode(65 + row) + (col + 1).toString().padStart(2, '0');
                    return {
                        id: ((parseInt(activeFloor) - 1) * 20) + (row * 5) + col + 1,
                        spotNumber: spotNumber,
                        floorNumber: activeFloor,
                        isOccupied: false,
                        carId: null
                    };
                });
            }
            console.log('Final parking spots:', parkingSpots);
        } catch (err) {
            console.error('Error loading parking spots:', err);
            error = 'Hiba történt a parkolóhelyek betöltése során.';
        } finally {
            loading = false;
        }
    }
    
    function getSpotStatus(spot) {
        console.log('Spot status check:', spot);
        if (!spot) return '';
        if (selectedSpot && spot.id === selectedSpot.id) {
            return 'selected';
        }
        if (spot.isOccupied) {
            return 'occupied';
        }
        if (spot.carId) {
            return 'reserved';
        }
        return 'available';
    }
    
    function handleSpotClick(spot) {
        console.log('Clicked spot:', spot);
        console.log('Selected spot:', selectedSpot);
        if (spot && !spot.isOccupied && !spot.carId) {
            selectedSpot = spot;
            console.log('Selected spot:', selectedSpot);
        }
    }

    function handleConfirmSelection() {
        console.log('Confirming selection with selectedCarId:', selectedCarId);
        if (!selectedCarId || isNaN(selectedCarId)) {
            console.error('No car selected or invalid car ID!');
            return;
        }
        
        if (selectedSpot && onSpotSelect) {
            const spotToSend = {
                id: parseInt(selectedSpot.id),
                spotNumber: selectedSpot.spotNumber,
                floorNumber: selectedSpot.floorNumber,
                isOccupied: selectedSpot.isOccupied,
                carId: selectedCarId
            };
            console.log('Sending spot to parent:', spotToSend);
            onSpotSelect(spotToSend);
        }
    }
</script>

<div class="modal-overlay">
    <div class="modal-content">
        <div class="parking-map-container">
            <div class="parking-header">
                <h3>Parkolóhelyek térképe</h3>
                <div class="floor-selector">
                    <button 
                        class="floor-button {activeFloor === '1' ? 'active' : ''}"
                        on:click={() => activeFloor = '1'}>
                        P1
                    </button>
                    <button 
                        class="floor-button {activeFloor === '2' ? 'active' : ''}"
                        on:click={() => activeFloor = '2'}>
                        P2
                    </button>
                    <button 
                        class="floor-button {activeFloor === '3' ? 'active' : ''}"
                        on:click={() => activeFloor = '3'}>
                        P3
                    </button>
                </div>
            </div>
            
            <div class="parking-content">
                {#if loading}
                    <div class="loading">Parkolóhelyek betöltése...</div>
                {:else if error}
                    <div class="error">{error}</div>
                {:else}
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-box available"></div>
                            <span>Szabad</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-box selected"></div>
                            <span>Kiválasztva</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-box occupied"></div>
                            <span>Foglalt</span>
                        </div>
                    </div>
                    
                    <div class="parking-grid">
                        {#each Array(4) as _, row}
                            <div class="parking-row">
                                {#each Array(5) as _, col}
                                    {@const spotNumber = String.fromCharCode(65 + row) + (col + 1).toString().padStart(2, '0')}
                                    {@const spot = parkingSpots.find(s => 
                                        s.floorNumber === activeFloor && 
                                        s.spotNumber === spotNumber
                                    ) || {
                                        id: ((parseInt(activeFloor) - 1) * 20) + (row * 5) + col + 1,
                                        spotNumber: spotNumber,
                                        floorNumber: activeFloor,
                                        isOccupied: false,
                                        carId: null
                                    }}
                                    <div 
                                        class="spot {getSpotStatus(spot)}"
                                        on:click={() => handleSpotClick(spot)}>
                                        <div class="spot-label">{spotNumber}</div>
                                        <div class="spot-status">
                                            {#if selectedSpot && spot.id === selectedSpot.id}
                                                Kiválasztva
                                            {:else if spot.isOccupied}
                                                Foglalt
                                            {:else if spot.carId}
                                                Foglalva
                                            {:else}
                                                Szabad
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/each}
                    </div>

                    {#if selectedSpot}
                        <div class="selection-panel">
                            <p>Kiválasztott parkolóhely: {selectedSpot.spotNumber}</p>
                            <button class="confirm-button" on:click={handleConfirmSelection}>
                                Parkolás indítása
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 100%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .parking-map-container {
        padding: 1.5rem;
    }

    .parking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .parking-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #2c3e50;
    }

    .floor-selector {
        display: flex;
        gap: 0.5rem;
    }

    .floor-button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;
        min-width: 48px;
        font-weight: 500;
    }

    .floor-button.active {
        background: #e74c3c;
        color: white;
    }

    .legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .legend-box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
    }

    .legend-box.available {
        background-color: #2ecc71;
    }

    .legend-box.selected {
        background-color: #f39c12;
    }

    .legend-box.occupied {
        background-color: #e74c3c;
    }

    .parking-grid {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .parking-row {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
    }

    .spot {
        aspect-ratio: 1;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        padding: 0.5rem;
        text-align: center;
    }

    .spot.available {
        background-color: #2ecc71;
        color: white;
    }

    .spot.selected {
        background-color: #f39c12;
        color: white;
        border-color: #e67e22;
    }

    .spot.occupied {
        background-color: #e74c3c;
        color: white;
        cursor: not-allowed;
    }

    .spot-label {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .spot-status {
        font-size: 0.875rem;
        opacity: 0.9;
    }

    .selection-panel {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
        text-align: center;
    }

    .selection-panel p {
        margin: 0 0 1rem 0;
        font-weight: 500;
    }

    .confirm-button {
        background: #2ecc71;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .confirm-button:hover {
        background: #27ae60;
    }

    @media (max-width: 768px) {
        .modal-overlay {
            padding: 0;
        }

        .modal-content {
            max-height: 100vh;
            border-radius: 0;
        }

        .parking-map-container {
            padding: 1rem;
        }

        .parking-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
        }

        .floor-selector {
            justify-content: center;
        }

        .parking-row {
            gap: 0.5rem;
        }

        .spot {
            padding: 0.25rem;
        }

        .spot-label {
            font-size: 1rem;
        }

        .spot-status {
            font-size: 0.75rem;
        }

        .legend {
            padding: 0.75rem;
            justify-content: space-around;
        }

        .legend-item {
            font-size: 0.875rem;
        }
    }

    @media (max-width: 480px) {
        .parking-grid {
            gap: 0.5rem;
        }

        .parking-row {
            gap: 0.25rem;
        }

        .spot {
            padding: 0.125rem;
        }

        .spot-label {
            font-size: 0.875rem;
            margin-bottom: 0.125rem;
        }

        .spot-status {
            font-size: 0.675rem;
        }
    }

    @media (min-width: 769px) {
        .parking-grid {
            max-width: 800px;
            margin: 0 auto;
        }

        .spot {
            transition: transform 0.2s;
        }

        .spot:hover:not(.occupied) {
            transform: scale(1.05);
        }
    }
</style> 