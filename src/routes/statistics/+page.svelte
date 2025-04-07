<script>
    import { onMount } from 'svelte';
    import { API_URL } from '$lib/apiClient';

    let parkingHistory = [];
    let summaryData = null;
    let carStats = [];
    let monthlyStats = null;
    let loading = false;
    let monthlyLoading = false;
    let error = null;
    let isHistoryExpanded = true;
    let selectedYear = new Date().getFullYear();
    let selectedMonth = new Date().getMonth() + 1;
    let years = [];
    const months = [
        { value: 1, name: 'Január' },
        { value: 2, name: 'Február' },
        { value: 3, name: 'Március' },
        { value: 4, name: 'Április' },
        { value: 5, name: 'Május' },
        { value: 6, name: 'Június' },
        { value: 7, name: 'Július' },
        { value: 8, name: 'Augusztus' },
        { value: 9, name: 'Szeptember' },
        { value: 10, name: 'Október' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];

    // Generate years from current year to 5 years back
    $: {
        const currentYear = new Date().getFullYear();
        years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    }

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
                await loadMonthlyStats();
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

    async function loadMonthlyStats() {
        monthlyLoading = true;
        try {
            const response = await fetch(`${API_URL}/api/statistics/monthly?year=${selectedYear}&month=${selectedMonth}`, {
                credentials: 'include'
            });
            if (response.ok) {
                monthlyStats = await response.json();
            } else {
                monthlyStats = null;
            }
        } catch (err) {
            console.error('Error loading monthly stats:', err);
            monthlyStats = null;
        } finally {
            monthlyLoading = false;
        }
    }

    async function handleMonthSelection() {
        monthlyStats = null;
        await loadMonthlyStats();
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
                <div class="statistics-section">
                    <div class="section-card">
                        <div class="section-header">
                            <i class="bi bi-graph-up text-primary me-2"></i>
                            <h2 class="text-2xl font-bold">Összesített statisztika</h2>
                        </div>
                        {#if summaryData}
                            <div class="summary-cards">
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
                    </div>
                </div>

                <div class="statistics-section">
                    <div class="section-card">
                        <div class="section-header">
                            <i class="bi bi-calendar-event text-primary me-2"></i>
                            <h2 class="text-2xl font-bold">Havi bontás</h2>
                        </div>
                        <div class="monthly-stats">
                            <div class="month-selector mb-4">
                                <div class="d-flex align-items-end gap-3">
                                    <div class="form-group">
                                        <label for="year-select" class="form-label">Év:</label>
                                        <select
                                            id="year-select"
                                            bind:value={selectedYear}
                                            class="form-select"
                                            style="width: auto;"
                                        >
                                            {#each years as year}
                                                <option value={year}>{year}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="month-select" class="form-label">Hónap:</label>
                                        <select
                                            id="month-select"
                                            bind:value={selectedMonth}
                                            class="form-select"
                                            style="width: auto;"
                                        >
                                            {#each months as month}
                                                <option value={month.value}>{month.name}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <button
                                        on:click={handleMonthSelection}
                                        class="btn btn-primary"
                                    >
                                        Kiválasztás
                                    </button>
                                </div>
                            </div>

                            {#if monthlyLoading}
                                <div class="d-flex justify-content-center align-items-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Betöltés...</span>
                                    </div>
                                </div>
                            {:else if monthlyStats}
                                <div class="monthly-details">
                                    <h3 class="text-xl font-semibold mb-4">{monthlyStats.monthName} {monthlyStats.year}</h3>
                                    <div class="details-grid">
                                        <div class="detail-item">
                                            <i class="bi bi-car-front-fill text-primary me-2"></i>
                                            <span>Parkolások száma: {monthlyStats.totalParkings} db</span>
                                        </div>
                                        <div class="detail-item">
                                            <i class="bi bi-currency-dollar text-success me-2"></i>
                                            <span>Összes díj: {monthlyStats.totalFee}</span>
                                        </div>
                                        <div class="detail-item">
                                            <i class="bi bi-clock-fill text-info me-2"></i>
                                            <span>Összes időtartam: {monthlyStats.totalDuration}</span>
                                        </div>
                                    </div>
                                </div>
                            {:else}
                                <div class="alert alert-info mt-4" role="alert">
                                    <i class="bi bi-info-circle-fill me-2"></i>
                                    Nincs adat a kiválasztott időszakra.
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                {#if carStats && carStats.length > 0}
                    <div class="statistics-section">
                        <div class="section-card">
                            <div class="section-header">
                                <i class="bi bi-car-front text-primary me-2"></i>
                                <h2 class="text-2xl font-bold">Autónkénti statisztika</h2>
                            </div>
                            <div class="car-stats">
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
                        </div>
                    </div>
                {/if}

                <div class="statistics-section">
                    <div class="section-card">
                        <div class="section-header">
                            <i class="bi bi-clock-history text-primary me-2"></i>
                            <h2 class="text-2xl font-bold">Parkolási előzmények</h2>
                        </div>
                        <div class="mt-4">
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
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .statistics-container {
        min-height: calc(100vh - 2rem);
        background-color: #ffffff;
        padding: 1rem;
    }

    .content-wrapper {
        min-height: calc(100vh - 4rem);
        background: linear-gradient(to bottom, #ffffff, #e3f2fd, #ffffff);
    }

    .statistics-section {
        margin-bottom: 2rem;
        padding: 0.5rem;
    }

    .section-card {
        background: #e3f2fd;
        border-radius: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        border: 1px solid rgba(13, 110, 253, 0.1);
    }

    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(13, 110, 253, 0.1);
    }

    .section-header i {
        font-size: 1.5rem;
    }

    .section-header h2 {
        margin: 0;
    }

    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .card {
        border-radius: 10px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        background: white !important;
    }

    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .monthly-stats {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .month-selector {
        margin-bottom: 1.5rem;
    }

    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .car-stats .card {
        background: white !important;
        margin-bottom: 1rem;
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
        background: rgba(13, 110, 253, 0.1);
        border-radius: 8px;
    }

    .table {
        width: 100%;
        margin-bottom: 1rem;
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
    }

    .table th {
        background-color: rgba(13, 110, 253, 0.1);
        font-weight: 600;
        padding: 0.75rem;
        border-bottom: 2px solid rgba(13, 110, 253, 0.1);
    }

    .table td {
        padding: 0.75rem;
        vertical-align: middle;
        border-bottom: 1px solid rgba(13, 110, 253, 0.1);
    }

    .table-hover tbody tr:hover {
        background-color: rgba(13, 110, 253, 0.05);
    }

    .overflow-x-auto {
        overflow-x: auto;
        background: white;
        border-radius: 10px;
        padding: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .fs-1 {
        font-size: 2.5rem !important;
    }

    .fs-2 {
        font-size: 2rem !important;
    }

    .form-select {
        min-width: 120px;
        max-width: 200px;
        border: 1px solid rgba(13, 110, 253, 0.2);
        border-radius: 8px;
    }

    .form-group {
        margin-bottom: 0;
    }

    .btn-primary {
        background-color: #0d6efd;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .btn-primary:hover {
        background-color: #0b5ed7;
        transform: translateY(-2px);
    }
</style> 