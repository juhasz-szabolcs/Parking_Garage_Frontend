<script>
    import { onMount } from 'svelte';
    import { API_URL } from '$lib/apiClient';

    let parkingHistory = [];
    let loading = false;
    let error = null;
    let isHistoryExpanded = true;

    async function loadParkingHistory() {
        loading = true;
        error = null;
        try {
            const response = await fetch(`${API_URL}/api/statistics/history`, {
                credentials: 'include'
            });
            if (response.ok) {
                parkingHistory = await response.json();
            } else {
                error = 'Hiba történt az adatok betöltése során.';
                console.error('Error loading parking history');
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
        <h1 class="text-3xl font-bold mb-8 px-4">Parkolási előzmények</h1>

        <div class="px-4">
            <div class="mt-8">
                <div class="border-t border-gray-200 pt-4">
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
                    {:else if parkingHistory.length === 0}
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
</style> 