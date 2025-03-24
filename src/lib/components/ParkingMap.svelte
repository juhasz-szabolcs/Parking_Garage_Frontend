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

<style>
    .parking-map-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
        margin: 20px;
    }

    .parking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .floor-selector {
        display: flex;
        gap: 10px;
    }

    .floor-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;
    }

    .floor-button.active {
        background: #e74c3c;
        color: white;
    }

    .legend {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .legend-box {
        width: 20px;
        height: 20px;
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
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .parking-row {
        display: flex;
        gap: 10px;
    }

    .spot {
        width: 100px;
        height: 100px;
        border: 2px solid #ddd;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background: white;
    }

    .spot.available {
        border-color: #2ecc71;
        background-color: rgba(46, 204, 113, 0.1);
    }

    .spot.available:hover {
        background-color: rgba(46, 204, 113, 0.2);
        transform: scale(1.05);
    }

    .spot.selected {
        border-color: #f39c12;
        background-color: rgba(243, 156, 18, 0.1);
    }

    .spot.occupied {
        border-color: #e74c3c;
        background-color: rgba(231, 76, 60, 0.1);
        cursor: not-allowed;
    }

    .spot-label {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .spot-status {
        font-size: 12px;
    }

    .selection-panel {
        margin-top: 20px;
        padding: 15px;
        background-color: rgba(243, 156, 18, 0.1);
        border: 2px solid #f39c12;
        border-radius: 8px;
        text-align: center;
    }

    .confirm-button {
        background-color: #f39c12;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
    }

    .confirm-button:hover {
        background-color: #e67e22;
        transform: translateY(-2px);
    }

    .loading {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .error {
        background-color: #fee;
        color: #e74c3c;
        padding: 15px;
        border-radius: 4px;
        text-align: center;
    }
</style> 