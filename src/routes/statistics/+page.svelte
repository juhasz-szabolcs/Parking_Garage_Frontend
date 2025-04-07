<script>
    import { onMount } from 'svelte';
    import { API_URL } from '$lib/apiClient';

    let parkingHistory = [];
    let summaryData = null;
    let carStats = [];
    let loading = false;
    let error = null;
    let isHistoryExpanded = true;

    async function loadParkingHistory() {
        loading = true;
        error = null;
        try {
            const [historyResponse, summaryResponse, carStatsResponse] = await Promise.all([
                fetch(`${API_URL}/api/statistics/history`, {
                    credentials: 'include'
                }),
                fetch(`${API_URL}/api/statistics/summary`, {
                    credentials: 'include'
                }),
                fetch(`${API_URL}/api/statistics/by-car`, {
                    credentials: 'include'
                })
            ]);

            if (historyResponse.ok && summaryResponse.ok && carStatsResponse.ok) {
                parkingHistory = await historyResponse.json();
                summaryData = await summaryResponse.json();
                carStats = await carStatsResponse.json();
            } else {
                error = 'Hiba történt az adatok betöltése során.';
                console.error('Error loading statistics data');
            }
        } catch (err) {
            console.error('Error:', err);
            error = 'Hiba történt az adatok betöltése során.';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadParkingHistory();
    });
</script>

<div class="statistics-container">
    <div class="content-wrapper bg-white shadow-lg rounded-lg p-8 mx-4 my-6">
        <h1 class="text-3xl font-bold mb-8 px-4">Parkolás összesítő</h1>

        <div class="px-4">
            {#if loading}
                <div class="d-flex justify-content-center align-items-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Betöltés...</span>
                    </div>
                </div>
            {:else if error}
                <div class="alert alert-danger mt-4" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            {:else}
                {#if summaryData}
                    <div class="summary-cards mb-8">
                        <div class="card border-0 bg-primary bg-opacity-10">
                            <div class="card-body text-center">
                                <i class="bi bi-car-front-fill text-primary fs-1 mb-2"></i>
                                <h5 class="card-title">Összes parkolás</h5>
                                <p class="card-text fs-2">{summaryData.totalParkings} db</p>
                            </div>
                        </div>
                        <div class="card border-0 bg-success bg-opacity-10">
                            <div class="card-body text-center">
                                <i class="bi bi-currency-dollar text-success fs-1 mb-2"></i>
                                <h5 class="card-title">Összes díj</h5>
                                <p class="card-text fs-2">{summaryData.totalFee}</p>
                            </div>
                        </div>
                        <div class="card border-0 bg-info bg-opacity-10">
                            <div class="card-body text-center">
                                <i class="bi bi-clock-fill text-info fs-1 mb-2"></i>
                                <h5 class="card-title">Átlagos időtartam</h5>
                                <p class="card-text fs-2">{summaryData.averageDuration}</p>
                            </div>
                        </div>
                    </div>
                {/if}

                {#if carStats && carStats.length > 0}
                    <h2 class="text-2xl font-bold mb-6 px-4">Autónkénti statisztika</h2>
                    <div class="car-stats mb-8">
                        {#each carStats as car}
                            <div class="card border-0 bg-light mb-4">
                                <div class="card-body">
                                    <div class="car-header mb-3">
                                        <h3 class="text-xl font-semibold">{car.brand} {car.model}</h3>
                                        <span class="badge bg-primary">{car.licensePlate}</span>
                                    </div>
                                    <div class="car-details">
                                        <div class="detail-item">
                                            <i class="bi bi-car-front-fill text-primary me-2"></i>
                                            <span>Parkolások száma: {car.totalParkings} db</span>
                                        </div>
                                        <div class="detail-item">
                                            <i class="bi bi-currency-dollar text-success me-2"></i>
                                            <span>Összes díj: {car.totalFee} Ft</span>
                                        </div>
                                        <div class="detail-item">
                                            <i class="bi bi-clock-fill text-info me-2"></i>
                                            <span>Összes időtartam: {car.totalDuration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

                <h2 class="text-2xl font-bold mb-6 px-4">Parkolási előzmények</h2>
                <div class="mt-8">
                    <div class="border-t border-gray-200 pt-4">
                        {#if parkingHistory.length === 0}
                            <div class="alert alert-info mt-4" role="alert">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                Még nincs parkolási előzmény.
                            </div>
                        {:else}
                            <div class="overflow-x-auto">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Dátum</th>
                                            <th>Autó</th>
                                            <th>Hely</th>
                                            <th>Időtartam</th>
                                            <th>Díj</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each parkingHistory as history}
                                            <tr>
                                                <td>{new Date(history.startTime).toLocaleDateString('hu-HU')}</td>
                                                <td>{history.carBrand} {history.carModel} ({history.licensePlate})</td>
                                                <td>{history.floorNumber}. emelet - {history.spotNumber}</td>
                                                <td>{history.durationFormatted}</td>
                                                <td>{history.fee} Ft</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .statistics-container {
        min-height: calc(100vh - 2rem);
        background-color: #f8f9fa;
        padding: 1rem;
    }

    .content-wrapper {
        min-height: calc(100vh - 4rem);
    }

    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .card {
        border-radius: 10px;
        transition: transform 0.3s ease;
    }

    .card:hover {
        transform: translateY(-5px);
    }

    .car-stats .card {
        background-color: #f8f9fa;
    }

    .car-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .car-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .detail-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
    }

    .table {
        width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
    }

    .table th {
        background-color: #f8f9fa;
        font-weight: 600;
        padding: 0.75rem;
        border-bottom: 2px solid #dee2e6;
    }

    .table td {
        padding: 0.75rem;
        vertical-align: middle;
        border-bottom: 1px solid #dee2e6;
    }

    .table-hover tbody tr:hover {
        background-color: rgba(0, 0, 0, 0.075);
    }

    .overflow-x-auto {
        overflow-x: auto;
    }

    .fs-1 {
        font-size: 2.5rem !important;
    }

    .fs-2 {
        font-size: 2rem !important;
    }
</style> 