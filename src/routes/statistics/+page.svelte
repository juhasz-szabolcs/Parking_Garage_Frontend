<script>
    import { onMount } from 'svelte';
    import { getCarLogo } from '$lib/utils/carLogos';
    import { getStatistics, getMonthlyStatistics } from '$lib/api';

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

    // Helper function to format numbers with thousand separator
    function formatNumber(num) {
        if (num === null || num === undefined) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    async function loadParkingHistory() {
        loading = true;
        error = null;
        try {
            const result = await getStatistics();
            if (result.success) {
                parkingHistory = result.data.history;
                summaryData = result.data.summary;
                carStats = result.data.carStats;
                await loadMonthlyStats();
            } else {
                error = result.error;
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
            const result = await getMonthlyStatistics(selectedYear, selectedMonth);
            if (result.success) {
                monthlyStats = result.data;
            } else {
                monthlyStats = null;
                console.error('Error loading monthly stats:', result.error);
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
                                        <p class="card-text fs-2">{formatNumber(summaryData.totalParkings)} db</p>
                                    </div>
                                </div>
                                <div class="card border-0 bg-success bg-opacity-10">
                                    <div class="card-body text-center">
                                        <i class="bi bi-currency-dollar text-success fs-1 mb-2"></i>
                                        <h5 class="card-title">Összes díj</h5>
                                        <p class="card-text fs-2">{formatNumber(summaryData.totalFee)}</p>
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
                                            <span>Parkolások száma: {formatNumber(monthlyStats.totalParkings)} db</span>
                                        </div>
                                        <div class="detail-item">
                                            <i class="bi bi-currency-dollar text-success me-2"></i>
                                            <span>Összes díj: {formatNumber(monthlyStats.totalFee)}</span>
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
                            <div class="overflow-x-auto">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style="width: 25%">Autó</th>
                                            <th style="width: 15%">Rendszám</th>
                                            <th style="width: 20%" class="text-center">Parkolások száma</th>
                                            <th style="width: 20%" class="text-center">Összes díj</th>
                                            <th style="width: 20%" class="text-center">Összes időtartam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each carStats as car}
                                            <tr>
                                                <td data-label="Autó">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <img src={getCarLogo(car.brand)} alt={car.brand} class="car-logo" />
                                                        <span class="font-semibold">{car.brand} {car.model}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Rendszám"><span class="badge bg-primary">{car.licensePlate}</span></td>
                                                <td data-label="Parkolások száma" class="text-center">
                                                    <div class="stat-cell">
                                                        <i class="bi bi-car-front-fill text-primary stat-icon"></i>
                                                        <span>{formatNumber(car.totalParkings)} db</span>
                                                    </div>
                                                </td>
                                                <td data-label="Összes díj" class="text-center">
                                                    <div class="stat-cell">
                                                        <i class="bi bi-currency-dollar text-success stat-icon"></i>
                                                        <span>{formatNumber(car.totalFee)} Ft</span>
                                                    </div>
                                                </td>
                                                <td data-label="Összes időtartam" class="text-center">
                                                    <div class="stat-cell">
                                                        <i class="bi bi-clock-fill text-info stat-icon"></i>
                                                        <span>{car.totalDuration}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
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
                                                <th style="width: 100px">Rendszám</th>
                                                <th>Hely</th>
                                                <th>Időtartam</th>
                                                <th>Díj</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each parkingHistory as history}
                                                <tr>
                                                    <td data-label="Dátum">{new Date(history.startTime).toLocaleDateString('hu-HU')}</td>
                                                    <td data-label="Autó">
                                                        <div class="d-flex align-items-center gap-2">
                                                            <img src={getCarLogo(history.carBrand)} alt={history.carBrand} class="car-logo" />
                                                            <span>{history.carBrand} {history.carModel}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Rendszám">
                                                        <span class="badge bg-secondary">{history.licensePlate}</span>
                                                    </td>
                                                    <td data-label="Hely">{history.floorNumber}. emelet - {history.spotNumber}</td>
                                                    <td data-label="Időtartam">
                                                        <div class="stat-cell">
                                                            <i class="bi bi-clock-fill text-info stat-icon"></i>
                                                            <span>{history.durationFormatted}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Díj">
                                                        <div class="stat-cell">
                                                            <i class="bi bi-currency-dollar text-success stat-icon"></i>
                                                            <span>{formatNumber(history.fee)} Ft</span>
                                                        </div>
                                                    </td>
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

    .statistics-container .table {
        width: 100%;
        margin-bottom: 1rem;
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        border-collapse: separate;
        border-spacing: 0 0.5rem;
    }

    .statistics-container .table th {
        background-color: rgba(13, 110, 253, 0.1);
        font-weight: 600;
        padding: 1rem 0.75rem;
        border-bottom: none;
        white-space: nowrap;
    }

    .statistics-container .table tbody tr {
        transition: all 0.2s ease;
        background: white;
        border: 1px solid rgba(13, 110, 253, 0.3);
        box-shadow: 0 3px 6px rgba(13, 110, 253, 0.15);
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .statistics-container .table tbody tr:hover {
        background-color: rgba(13, 110, 253, 0.03);
        transform: translateY(-1px);
        border-color: rgba(13, 110, 253, 0.5);
        box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
    }

    .statistics-container .table td {
        padding: 1rem 0.75rem;
        vertical-align: middle;
        white-space: nowrap;
        border: none;
        background: white;
    }

    .statistics-container .table td:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }

    .statistics-container .table td:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    .statistics-container .overflow-x-auto {
        overflow-x: auto;
        background: #f8f9fa;
        border-radius: 10px;
        padding: 1.5rem;
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

    .badge {
        font-size: 0.875rem;
        padding: 0.4em 0.8em;
    }

    .font-semibold {
        font-weight: 600;
    }

    .car-logo {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .gap-2 {
        gap: 0.5rem;
    }

    .text-center {
        text-align: center;
    }

    .d-flex {
        display: flex;
    }

    .align-items-center {
        align-items: center;
    }

    .justify-content-center {
        justify-content: center;
    }

    .stat-cell {
        position: relative;
        padding-left: 1.5rem;
        display: inline-block;
    }

    .stat-icon {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    @media (max-width: 768px) {
        .statistics-container {
            padding: 0.5rem;
        }

        .content-wrapper {
            padding: 1rem !important;
            margin: 0.5rem !important;
        }

        .section-card {
            padding: 1rem;
        }

        .summary-cards {
            gap: 1rem;
        }

        .month-selector .d-flex {
            flex-direction: column;
            gap: 1rem;
        }

        .month-selector .form-group {
            width: 100%;
        }

        .month-selector .form-select {
            width: 100%;
            max-width: none;
        }

        .month-selector .btn-primary {
            width: 100%;
        }

        .details-grid {
            grid-template-columns: 1fr;
        }

        .table {
            display: block;
            width: 100%;
        }

        .table thead {
            display: none;
        }

        .table tbody {
            display: block;
            width: 100%;
        }

        .table tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid rgba(13, 110, 253, 0.05);
            border-radius: 8px;
            padding: 0.5rem;
            background: white;
            box-shadow: 0 2px 4px rgba(13, 110, 253, 0.05);
            transition: background-color 0.2s ease;
        }

        .table tr:hover {
            background-color: rgba(13, 110, 253, 0.03);
        }

        .table td {
            display: flex;
            padding: 0.5rem;
            border: none;
            align-items: center;
            white-space: normal;
        }

        .table td::before {
            content: attr(data-label);
            font-weight: 600;
            margin-right: 0.5rem;
            min-width: 120px;
        }

        .stat-cell {
            width: 100%;
            padding-left: 2rem;
        }

        .badge {
            display: inline-block;
            margin: 0.25rem 0;
        }

        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .section-header i {
            font-size: 1.25rem;
        }

        h1 {
            font-size: 1.5rem !important;
        }

        h2 {
            font-size: 1.25rem !important;
        }

        .fs-1 {
            font-size: 2rem !important;
        }

        .fs-2 {
            font-size: 1.5rem !important;
        }

        .statistics-container .table tbody tr {
            display: block;
            margin-bottom: 1rem;
            padding: 0.75rem;
            border: 1px solid rgba(13, 110, 253, 0.2);
            box-shadow: 0 2px 4px rgba(13, 110, 253, 0.1);
        }

        .statistics-container .table td {
            display: flex;
            padding: 0.5rem;
            background: transparent;
        }
    }
</style> 