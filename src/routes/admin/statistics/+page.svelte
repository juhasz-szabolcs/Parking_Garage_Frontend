<script>
    import { onMount } from 'svelte';
    import { getMonthlyRevenue } from '$lib/api';
    import { API_URL } from '$lib/apiClient';

    let monthlyRevenue = [];
    let selectedYear = new Date().getFullYear();
    let years = [];
    let loading = false;
    let error = null;
    let isMonthlyDataExpanded = false;

    // Generate years from current year to 5 years back
    $: {
        const currentYear = new Date().getFullYear();
        years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    }

    async function loadMonthlyRevenue() {
        loading = true;
        error = null;
        try {
            const result = await getMonthlyRevenue(selectedYear);
            if (result.success) {
                monthlyRevenue = result.data.monthlyRevenue;
                console.log('MONTHLY REVENUE', monthlyRevenue);
            } else {
                error = result.error;
            }
        } catch (err) {
            console.error('Error loading monthly revenue:', err);
            error = 'Hiba történt az adatok betöltése során.';
        } finally {
            loading = false;
        }
    }

    async function toggleMonthlyData() {
        if (!isMonthlyDataExpanded) {
            await loadMonthlyRevenue();
        }
        isMonthlyDataExpanded = !isMonthlyDataExpanded;
    }

    async function handleYearSelection() {
        if (isMonthlyDataExpanded) {
            await loadMonthlyRevenue();
        }
    }

    onMount(() => {
        // No longer load data on mount
    });
</script>

<div class="statistics-container">
    <div class="content-wrapper bg-white shadow-lg rounded-lg p-8 mx-4 my-6">
        <h1 class="text-3xl font-bold mb-8 px-4">Statisztikák</h1>

        <div class="px-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Havi bontás megtekintése</h2>

            <div class="mb-6">
                <label for="year-select" class="block text-sm font-medium text-gray-700 mb-2">Válasszon évet:</label>
                <div class="d-flex align-items-center gap-3">
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
                    <button
                        on:click={handleYearSelection}
                        class="btn btn-primary"
                        disabled={!isMonthlyDataExpanded}
                    >
                        Kiválasztás
                    </button>
                </div>
            </div>

            <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center cursor-pointer mb-4 py-2" on:click={toggleMonthlyData}>
                    <span class="text-sm text-gray-500">Kattintson a havi adatok {isMonthlyDataExpanded ? 'elrejtéséhez' : 'megjelenítéséhez'}</span>
                    <i class="bi {isMonthlyDataExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} text-gray-500 text-xl"></i>
                </div>
                
                {#if isMonthlyDataExpanded}
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
                        <div class="mt-4 px-2">
                            {#each monthlyRevenue as revenue}
                                <div class="card mb-3 border-0 bg-light">
                                    <div class="card-body p-4">
                                        <div class="row align-items-center">
                                            <div class="col-md-3">
                                                <h5 class="mb-0 text-primary ps-3">{revenue.monthName}</h5>
                                            </div>
                                            <div class="col-md-3 text-center">
                                                <div class="d-flex align-items-center justify-content-center">
                                                    <i class="bi bi-p-circle-fill text-primary me-2"></i>
                                                    <span class="fs-5">{revenue.totalParkings} parkolás</span>
                                                </div>
                                            </div>
                                            <div class="col-md-3 text-center">
                                                <div class="d-flex align-items-center justify-content-center">
                                                    <i class="bi bi-currency-dollar text-success me-2"></i>
                                                    <span class="fs-5">{revenue.totalRevenue}</span>
                                                </div>
                                            </div>
                                            <!-- <div class="col-md-3">
                                                <div class="progress" style="height: 10px;">
                                                    <div
                                                        class="progress-bar bg-primary"
                                                        role="progressbar"
                                                        style="width: {(revenue.totalParkings / Math.max(...monthlyRevenue.map(r => r.totalParkings)) * 100)}%"
                                                        aria-valuenow={revenue.totalParkings}
                                                        aria-valuemin="0"
                                                        aria-valuemax={Math.max(...monthlyRevenue.map(r => r.totalParkings))}
                                                    ></div>
                                                </div>
                                                <div class="text-muted text-center mt-1 small">
                                                    Kihasználtság: {Math.round((revenue.totalParkings / Math.max(...monthlyRevenue.map(r => r.totalParkings)) * 100))}%
                                                </div>
                                            </div> -->
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
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

    :global(.card) {
        transition: all 0.3s ease;
        border-radius: 10px;
    }

    :global(.card:hover) {
        transform: translateX(5px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    :global(.progress) {
        border-radius: 10px;
        background-color: #e9ecef;
    }

    :global(.progress-bar) {
        transition: width 0.6s ease;
        border-radius: 10px;
    }

    :global(.form-select) {
        min-width: 120px;
        max-width: 200px;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style> 