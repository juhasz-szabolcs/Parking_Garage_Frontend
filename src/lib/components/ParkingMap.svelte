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

<div class="parking-container">
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
                <div class="parking-stats">
                    <div class="stat-item">
                        <span class="stat-label">Szabad helyek:</span>
                        <span class="stat-value available">{parkingSpots.filter(spot => !spot.isOccupied && !spot.carId).length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Foglalt helyek:</span>
                        <span class="stat-value occupied">{parkingSpots.filter(spot => spot.isOccupied).length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Foglalva:</span>
                        <span class="stat-value reserved">{parkingSpots.filter(spot => spot.carId && !spot.isOccupied).length}</span>
                    </div>
                </div>

                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-box available"></div>
                        <span>Szabad</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-box occupied"></div>
                        <span>Foglalt</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-box reserved"></div>
                        <span>Foglalva</span>
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

<style>
    .parking-container {
        width: 100%;
        height: calc(100vh - 64px);
        background-color: #f8f9fa;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
    }

    .parking-map-container {
        background: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }

    .parking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .parking-header h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #2c3e50;
    }

    .floor-selector {
        display: flex;
        gap: 0.25rem;
    }

    .floor-button {
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 3px;
        background: #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;
        min-width: 40px;
        font-weight: 500;
        font-size: 0.8rem;
    }

    .floor-button.active {
        background: #e74c3c;
        color: white;
    }

    .parking-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 0.5rem;
        padding: 0.25rem;
        background: #f8f9fa;
        border-radius: 3px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        min-width: 80px;
    }

    .stat-label {
        font-size: 0.7rem;
        color: #666;
    }

    .stat-value {
        font-size: 1rem;
        font-weight: bold;
    }

    .stat-value.available {
        color: #2ecc71;
    }

    .stat-value.occupied {
        color: #e74c3c;
    }

    .stat-value.reserved {
        color: #f39c12;
    }

    .legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.25rem;
        background: #f8f9fa;
        border-radius: 3px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.7rem;
    }

    .legend-box {
        width: 12px;
        height: 12px;
        border-radius: 2px;
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

    .legend-box.reserved {
        background-color: #f39c12;
        border: 2px dashed #e67e22;
    }

    .parking-grid {
        display: grid;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
        flex: 1;
        min-height: 0;
    }

    .parking-row {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.25rem;
    }

    .spot {
        aspect-ratio: 1;
        border: 1px solid #e9ecef;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        text-align: center;
        font-size: 0.7rem;
    }

    .spot.available {
        background-color: #2ecc71;
        color: white;
    }

    .spot.selected {
        background-color: #f39c12;
        color: white;
        border-color: #e67e22;
        transform: scale(1.05);
    }

    .spot.occupied {
        background-color: #e74c3c;
        color: white;
        cursor: not-allowed;
    }

    .spot.reserved {
        background-color: #f39c12;
        color: white;
        border-style: dashed;
    }

    .spot-label {
        font-size: 0.8rem;
        font-weight: bold;
        margin-bottom: 0.125rem;
    }

    .spot-status {
        font-size: 0.6rem;
        opacity: 0.9;
    }

    .selection-panel {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 2rem;
        text-align: center;
    }

    .selection-panel p {
        margin: 0 0 1rem 0;
        font-weight: 500;
        font-size: 1.2rem;
    }

    .confirm-button {
        background: #2ecc71;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s;
    }

    .confirm-button:hover {
        background: #27ae60;
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .parking-container {
            padding: 0.25rem;
            height: calc(100vh - 48px);
        }

        .parking-map-container {
            padding: 0.25rem;
        }

        .parking-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
        }

        .parking-header h3 {
            font-size: 1rem;
        }

        .floor-selector {
            justify-content: center;
        }

        .parking-stats {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.25rem;
            padding: 0.125rem;
        }

        .stat-item {
            flex: 1;
            min-width: 80px;
        }

        .stat-label {
            font-size: 0.65rem;
        }

        .stat-value {
            font-size: 0.9rem;
        }

        .legend {
            padding: 0.125rem;
            gap: 0.25rem;
        }

        .legend-item {
            font-size: 0.65rem;
        }

        .parking-grid {
            gap: 0.125rem;
        }

        .parking-row {
            gap: 0.125rem;
        }

        .spot {
            padding: 0.125rem;
        }

        .spot-label {
            font-size: 0.7rem;
        }

        .spot-status {
            font-size: 0.55rem;
        }
    }

    @media (max-width: 480px) {
        .parking-container {
            padding: 0.125rem;
        }

        .parking-map-container {
            padding: 0.125rem;
        }

        .parking-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.25rem;
            padding: 0.25rem;
        }

        .stat-item {
            min-width: unset;
            width: 100%;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .stat-label {
            font-size: 0.65rem;
            white-space: nowrap;
        }

        .stat-value {
            font-size: 0.8rem;
        }

        .legend {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.25rem;
            padding: 0.25rem;
            align-items: center;
        }

        .legend-item {
            justify-content: center;
            font-size: 0.65rem;
            white-space: nowrap;
        }

        .parking-grid {
            gap: 0.125rem;
        }

        .parking-row {
            gap: 0.125rem;
        }

        .spot {
            padding: 0.125rem;
        }

        .spot-label {
            font-size: 0.65rem;
            margin-bottom: 0.125rem;
        }

        .spot-status {
            font-size: 0.5rem;
        }
    }
</style> 