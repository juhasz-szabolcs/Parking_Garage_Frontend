<script>
    import { onMount } from 'svelte';
    import { getMonthlyRevenue } from '$lib/api';
    import { API_URL } from '$lib/apiClient';

    let monthlyRevenue = [];
    let selectedYear = new Date().getFullYear();
    let years = [];
    let loading = false;
    let error = null;

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

    $: if (selectedYear) {
        loadMonthlyRevenue();
    }

    onMount(() => {
        loadMonthlyRevenue();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Statisztikák</h1>

    <div class="mb-6">
        <label for="year-select" class="block text-sm font-medium text-gray-700 mb-2">Válasszon évet:</label>
        <select
            id="year-select"
            bind:value={selectedYear}
            class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
            {#each years as year}
                <option value={year}>{year}</option>
            {/each}
        </select>
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{error}</span>
        </div>
    {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hónap
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parkolások száma
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bevétel
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each monthlyRevenue as revenue}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {revenue.monthName}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {revenue.totalParkings}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {revenue.totalRevenue}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div> 