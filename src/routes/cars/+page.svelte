<script>
    // import { onMount } from "svelte";
    import { getUserData, createCar, updateCar, startParking, stopParking, deleteCar } from "$lib/api";
    import { isAuthenticated, user } from "$lib/store";
    import { goto } from "$app/navigation";
    import ParkingMap from "$lib/components/ParkingMap.svelte";
    import { getCarLogo, carBrandOptions } from "$lib/utils/carLogos";
    import { formatLicensePlate, isValidHungarianLicensePlate, normalizeLicensePlate } from "$lib/utils/licensePlate";
    import carModelsByBrand from "$lib/data/carModels.json";

    let cars = [];
    let ownedCars = [];
    let loading = true;
    let actionInProgress = false;
    let error = "";
    let success = "";
    let warning = "";
    let parkingSpots = [];
    // let activeParkings = new Map(); // Tárolja az aktív parkolásokat: carId -> parkingSpotId

    // New car form state
    let showModal = false;
    let editingCarId = null;
    let newCar = {
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
    };
    let formLoading = false;
    $: licensePlateLength = newCar.licensePlate?.length ?? 0;

    let showParkingMap = false;
    let selectedCar = null;

    import { onMount } from "svelte";

    // Brand autocomplete state
    let showBrandSuggestions = false;
    let highlightedBrandIndex = -1;
    let lastValidBrandInput = "";
    $: filteredBrandOptions = (() => {
        const query = (newCar.brand || "").toLowerCase().trim();
        return query
            ? carBrandOptions.filter((b) => b.toLowerCase().includes(query))
            : carBrandOptions;
    })();
    $: matchedBrandForModels = carBrandOptions.find(
        (brand) => brand.toLowerCase() === (newCar.brand || "").trim().toLowerCase()
    ) || "";
    $: selectedBrandModels = matchedBrandForModels ? (carModelsByBrand[matchedBrandForModels] || []) : [];

    function handleBrandFocus() {
        showBrandSuggestions = true;
        highlightedBrandIndex = -1;
    }

    function selectBrand(brand) {
        if (newCar.brand !== brand) {
            newCar.model = "";
        }
        newCar.brand = brand;
        lastValidBrandInput = brand;
        showBrandSuggestions = false;
        highlightedBrandIndex = -1;
    }

    function handleBrandInput(event) {
        const rawValue = event.currentTarget.value ?? "";
        const normalizedInput = rawValue.trim().toLowerCase();

        // Üres mező engedett.
        if (!normalizedInput) {
            newCar.brand = "";
            lastValidBrandInput = "";
            newCar.model = "";
            showBrandSuggestions = true;
            highlightedBrandIndex = -1;
            return;
        }

        const hasMatchingBrand = carBrandOptions.some((brand) =>
            brand.toLowerCase().includes(normalizedInput)
        );

        if (hasMatchingBrand) {
            newCar.brand = rawValue;
            lastValidBrandInput = rawValue;
            showBrandSuggestions = true;
            highlightedBrandIndex = -1;
            return;
        }

        // Ha nincs egyezés a listában, visszaállítjuk az utolsó érvényes állapotot.
        event.currentTarget.value = lastValidBrandInput;
        newCar.brand = lastValidBrandInput;
    }

    function handleBrandKeydown(event) {
        if (!showBrandSuggestions && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            showBrandSuggestions = true;
        }
        if (!filteredBrandOptions.length) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            highlightedBrandIndex = Math.min(highlightedBrandIndex + 1, filteredBrandOptions.length - 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            highlightedBrandIndex = Math.max(highlightedBrandIndex - 1, 0);
        } else if (event.key === 'Enter') {
            if (highlightedBrandIndex >= 0) {
                event.preventDefault();
                selectBrand(filteredBrandOptions[highlightedBrandIndex]);
            }
        } else if (event.key === 'Escape') {
            showBrandSuggestions = false;
            highlightedBrandIndex = -1;
        }
    }
    onMount(async () => {
        if (!$isAuthenticated || !$user) {
            console.log('User not authenticated, redirecting to home');
            goto("/");
            return;
        }
        await loadCars();
    });

    async function loadCars() {
        loading = true;
        error = "";

        try {
            const result = await getUserData($user.id);
            // console.log("API response:", result);
            
            if (result.success) {
                cars = result.data.cars;
                ownedCars = cars;
                // console.log("Loaded cars:", cars);
                cars.forEach(car => {
                    // console.log(`Car ${car.brand} ${car.model} isParked:`, car.isParking);
                });
            } else {
                // console.log("Failed to load cars:", result.error);
                error = result.error || "Nem sikerült betölteni az autókat";
                // If we get an error, redirect to home
                goto("/");
            }
        } catch (error) {
            console.error("Error loading cars:", error);
            error = "Hiba történt az autók betöltése során";
            // If we get an error, redirect to home
            goto("/");
        } finally {
            loading = false;
        }
    }

    function openAddCarModal() {
        // Reset form
        formLoading = false;
        editingCarId = null;
        newCar = {
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            licensePlate: "",
        };
        lastValidBrandInput = "";
        error = "";
        showModal = true;
    }

    function openEditCarModal(car) {
        formLoading = false;
        editingCarId = car.id;
        newCar = {
            brand: car.brand || "",
            model: car.model || "",
            year: car.year || new Date().getFullYear(),
            licensePlate: car.licensePlate || "",
        };
        lastValidBrandInput = newCar.brand;
        error = "";
        success = "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        editingCarId = null;
        formLoading = false;
    }

    async function submitCarForm() {
        // Dupla kattintás / dupla submit elleni védelem
        if (formLoading) return;

        error = "";
        success = "";
        formLoading = true;

        // Validate form
        if (!newCar.brand || !newCar.model || !newCar.licensePlate) {
            error = "Kérjük, töltse ki az összes kötelező mezőt!";
            formLoading = false;
            return;
        }
        const matchedBrand = carBrandOptions.find(
            (brand) => brand.toLowerCase() === newCar.brand.trim().toLowerCase()
        );
        if (!matchedBrand) {
            error = "Kérjük, válasszon a listában szereplő márkák közül!";
            formLoading = false;
            return;
        }
        const modelsForBrand = carModelsByBrand[matchedBrand] || [];
        const matchedModel = modelsForBrand.find(
            (model) => model.toLowerCase() === newCar.model.trim().toLowerCase()
        );
        if (!matchedModel) {
            error = "Kérjük, válasszon a listában szereplő modellek közül!";
            formLoading = false;
            return;
        }
        if (newCar.licensePlate.length > 7) {
            error = "A rendszám legfeljebb 7 karakter lehet!";
            formLoading = false;
            return;
        }
        if (!isValidHungarianLicensePlate(newCar.licensePlate)) {
            error = "Érvénytelen rendszám formátum. Elfogadott: AAA-123 vagy AA-AA 123.";
            formLoading = false;
            return;
        }
        newCar.brand = matchedBrand;
        newCar.model = matchedModel;
        newCar.licensePlate = normalizeLicensePlate(newCar.licensePlate);

        // Send to API
        const result = editingCarId
            ? await updateCar(editingCarId, newCar)
            : await createCar(newCar);

        if (result.success) {
            success = editingCarId
                ? "Autó sikeresen módosítva!"
                : "Autó sikeresen hozzáadva!";
            await loadCars(); // Reload cars list
            setTimeout(() => {
                success = "";
                closeModal();
            }, 1500);
        } else {
            error =
                typeof result.error === "string"
                    ? result.error
                    : "Nem sikerült létrehozni az autót.";
            formLoading = false;
        }
    }

    async function handleStartParking(carId, parkingSpotId) {
        if (!parkingSpotId) {
            error = 'Nincs kiválasztva parkolóhely!';
            return;
        }
        
        try {
            const result = await startParking(carId, parkingSpotId);
            if (result.success) {
                // Frissítjük az autók listáját
                await loadCars();
            } else {
                error = result.error || 'Hiba történt a parkolás indítása során.';
            }
        } catch (err) {
            console.error('Error starting parking:', err);
            error = 'Hiba történt a parkolás indítása során.';
        }
    }

    async function handleStopParking(carId) {
        actionInProgress = true;
        error = "";
        success = "";
        warning = "";
        try {
            const result = await stopParking(carId);
            if (result.success) {
                // Frissítjük az autók listáját
                await loadCars();
                success = "Parkolás sikeresen leállítva!";
                if (result.data?.invoiceWarning) {
                    warning = result.data.invoiceWarning;
                }
            } else {
                error = result.error || 'Hiba történt a parkolás leállítása során.';
            }
        } catch (err) {
            console.error('Error stopping parking:', err);
            error = 'Hiba történt a parkolás leállítása során.';
        } finally {
            actionInProgress = false;
        }
    }

    function openParkingMap(car) {
        // console.log('Opening parking map for car:', car);
        if (!car || !car.id || isNaN(car.id)) {
            console.error('Invalid car or car ID:', car);
            error = 'Érvénytelen autó kiválasztás!';
            return;
        }
        // console.log('Car ID:', car.id);
        selectedCar = car;
        // console.log('Selected car after assignment:', selectedCar);
        // console.log('Selected car ID after assignment:', selectedCar?.id);
        showParkingMap = true;
    }

    function closeParkingMap() {
        showParkingMap = false;
        selectedCar = null;
    }

    async function handleSpotSelect(spot) {
        // console.log('Selected car:', selectedCar);
        // console.log('Selected spot:', spot);
        if (selectedCar && selectedCar.id) {
            // console.log('Starting parking with carId:', selectedCar.id, 'and parkingSpotId:', spot.id);
            await handleStartParking(selectedCar.id, spot.id);
            closeParkingMap();
        } else {
            error = 'Nincs kiválasztva autó!';
        }
    }

    async function handleDeleteCar(car) {
        if (car.isParking && !$user?.isAdmin) {
            error = "Parkoló autó nem törölhető. Előbb állítsd le a parkolást.";
            return;
        }

        if (confirm('Biztosan törölni szeretnéd ezt az autót?')) {
            actionInProgress = true;
            error = "";
            success = "";
            warning = "";
            try {
                if (car.isParking && $user?.isAdmin) {
                    const stopResult = await stopParking(car.id);
                    if (!stopResult.success) {
                        error = stopResult.error || "Nem sikerült leállítani a parkolást, ezért a törlés megszakadt.";
                        return;
                    }
                    if (stopResult.data?.invoiceWarning) {
                        warning = stopResult.data.invoiceWarning;
                    }
                }

                const result = await deleteCar(car.id);
                if (result.success) {
                    // Frissítjük az autók listáját
                    await loadCars();
                    success = "Autó sikeresen törölve!";
                    setTimeout(() => {
                        success = "";
                        warning = "";
                    }, 1500);
                } else {
                    error = result.error || 'Hiba történt az autó törlése során.';
                }
            } catch (err) {
                console.error('Error deleting car:', err);
                error = 'Hiba történt az autó törlése során.';
            } finally {
                actionInProgress = false;
            }
        }
    }
</script>

<div class="cars-container">
    <div class="header">
        <h1>Autóim</h1>
        <button class="add-button" on:click={openAddCarModal}
            >+ Autó hozzáadása</button
        >
    </div>

    {#if loading}
        <div class="loading">Autók betöltése...</div>
    {:else if error && !showModal}
        <div class="error-message">{error}</div>
    {:else if warning && !showModal}
        <div class="warning-message">{warning}</div>
    {:else if cars.length === 0}
        <div class="empty-state">
            <p>Még nincsenek autói. Adjon hozzá egy autót a kezdéshez!</p>
        </div>
    {:else}
        <div class="cars-grid">
            {#each cars as car (car.id)}
                <div class="car-card">
                    <div class="car-header">
                        <div class="car-logo-wrap">
                            <img src={getCarLogo(car.brand)} alt={car.brand} class="car-logo" />
                        </div>
                        <div class="car-title">
                            <h3>{car.brand}</h3>
                            <h4>{car.model}</h4>
                        </div>
                        <button
                            class="edit-icon-button"
                            type="button"
                            on:click={() => openEditCarModal(car)}
                            disabled={actionInProgress}
                            title="Autó szerkesztése"
                            aria-label="Autó szerkesztése"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                    <div class="car-details">
                        <p><strong>Rendszám:</strong> {formatLicensePlate(car.licensePlate)}</p>
                        <p><strong>Évjárat:</strong> {car.year}</p>
                        {#if car.isParking}
                            <p class="parking-status parked">Jelenleg parkol</p>
                        {:else}
                            <p class="parking-status not-parked">Nincs parkolva</p>
                        {/if}
                    </div>
                    <div class="car-actions">
                        {#if !car.isParking}
                            <button class="park-button" id=car_{car.id} on:click={() => openParkingMap(car)} disabled={actionInProgress}>
                                Parkolás indítása
                            </button>
                        {:else}
                            <button class="stop-button" id=car_{car.id} on:click={() => handleStopParking(car.id)} disabled={actionInProgress}>
                                Parkolás leállítása
                            </button>
                        {/if}
                        <button
                            class="delete-button"
                            on:click={() => handleDeleteCar(car)}
                            disabled={actionInProgress || (car.isParking && !$user?.isAdmin)}
                            title={car.isParking && !$user?.isAdmin ? 'Parkoló autó nem törölhető' : 'Autó törlése'}
                        >
                            Törlés
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Add Car Modal -->
    {#if showModal}
        <div class="modal-overlay" on:click={closeModal}>
            <div class="modal-content" on:click|stopPropagation>
                <div class="modal-header">
                    <h2>{editingCarId ? "Autó szerkesztése" : "Új autó hozzáadása"}</h2>
                    <button class="close-button" on:click={closeModal}
                        >&times;</button
                    >
                </div>

                {#if error}
                    <div class="error-message">{error}</div>
                {/if}

                {#if success}
                    <div class="success-message">{success}</div>
                {/if}

                <form on:submit|preventDefault={submitCarForm}>
                    <div class="form-group">
                        <label for="brand">Márka*</label>
                        <div class="brand-autocomplete">
                            <input
                                type="text"
                                id="brand"
                                bind:value={newCar.brand}
                                placeholder="pl. Toyota"
                                required
                                on:focus={handleBrandFocus}
                                on:input={handleBrandInput}
                                on:keydown={handleBrandKeydown}
                                on:blur={() => setTimeout(() => showBrandSuggestions = false, 100)}
                                autocomplete="off"
                                style={newCar.brand?.trim()
                                    ? `background-image: url('${getCarLogo(newCar.brand)}'); background-repeat: no-repeat; background-position: right 0.6rem center; background-size: 24px 24px; padding-right: 2.4rem;`
                                    : ''}
                            />
                            {#if showBrandSuggestions && filteredBrandOptions.length > 0}
                                <div class="brand-suggestions">
                                    {#each filteredBrandOptions as brand, i}
                                        <div
                                            class="brand-option {i === highlightedBrandIndex ? 'highlighted' : ''}"
                                            on:mousedown|preventDefault={() => selectBrand(brand)}
                                            on:mouseover={() => highlightedBrandIndex = i}
                                        >
                                            <img class="brand-logo" src={getCarLogo(brand)} alt={brand} />
                                            <span class="brand-name">{brand}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="model">Modell*</label>
                        <select id="model" bind:value={newCar.model} required disabled={!matchedBrandForModels}>
                            <option value="" disabled>
                                {matchedBrandForModels ? "Válassz modellt" : "Előbb válassz márkát"}
                            </option>
                            {#each selectedBrandModels as model}
                                <option value={model}>{model}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="year">Évjárat</label>
                        <input
                            type="number"
                            id="year"
                            bind:value={newCar.year}
                            min="1900"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div class="form-group">
                        <label for="licensePlate">Rendszám*</label>
                        <input
                            type="text"
                            id="licensePlate"
                            bind:value={newCar.licensePlate}
                            placeholder="pl. ABC-123"
                            maxlength="7"
                            required
                        />
                        <small class="field-hint {licensePlateLength === 7 ? 'limit' : ''}">
                            {licensePlateLength}/7 karakter
                            {#if licensePlateLength === 7}
                                - elérted a maximum hosszúságot
                            {/if}
                        </small>
                    </div>

                    <div class="form-actions">
                        <button
                            type="button"
                            class="cancel-button"
                            on:click={closeModal}>Mégse</button
                        >
                        <button
                            type="submit"
                            class="submit-button"
                            disabled={formLoading}
                        >
                            {formLoading ? "Mentés..." : editingCarId ? "Módosítás mentése" : "Mentés"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    {#if showParkingMap}
        <div class="modal-overlay" on:click={closeParkingMap}>
            <div class="modal-content parking-map-modal" on:click|stopPropagation>
                <div class="modal-header">
                    <h2>Parkolóhely kiválasztása</h2>
                    <button class="close-button" on:click={closeParkingMap}>&times;</button>
                </div>
                <ParkingMap 
                    onSpotSelect={handleSpotSelect} 
                    selectedCarId={selectedCar?.id} 
                />
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body.dark-mode) .car-card {
        background: linear-gradient(135deg, #404040 0%, #313131 100%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        border: 1px solid #4a4a4a;
    }

    :global(body.dark-mode) .car-title h3 {
        color: #f3f4f6;
    }

    :global(body.dark-mode) .car-title h4 {
        color: #d1d5db;
    }

    :global(body.dark-mode) .car-details p {
        color: #e5e7eb;
    }

    :global(body.dark-mode) .car-details p strong {
        color: #f9fafb;
    }

    :global(body.dark-mode) .not-parked {
        background-color: #474747;
        color: #f3f4f6;
        border: 1px solid #5a5a5a;
    }

    :global(body.dark-mode) .parked {
        background-color: #6a4a24;
        color: #fff4e6;
        border: 1px solid #8a6230;
    }

    :global(body.dark-mode) .car-logo {
        filter: brightness(1.08) contrast(1.04);
    }

    :global(body.dark-mode) .car-logo-wrap {
        background-color: #454545;
        border: 1px solid #5a5a5a;
        border-radius: 10px;
    }

    :global(body.dark-mode) .modal-overlay {
        background-color: rgba(0, 0, 0, 0.72);
    }

    :global(body.dark-mode) .modal-content,
    :global(body.dark-mode) .modal-header,
    :global(body.dark-mode) .form-actions {
        background-color: #2f2f2f;
        color: #f3f4f6;
        border-color: #4a4a4a;
    }

    :global(body.dark-mode) .modal-header h2,
    :global(body.dark-mode) label,
    :global(body.dark-mode) .field-hint {
        color: #e5e7eb;
    }

    :global(body.dark-mode) input,
    :global(body.dark-mode) select,
    :global(body.dark-mode) .brand-suggestions {
        background: #3a3a3a;
        color: #f3f4f6;
        border-color: #565656;
    }

    :global(body.dark-mode) .brand-option:hover,
    :global(body.dark-mode) .brand-option.highlighted {
        background: #4a4a4a;
    }

    .cars-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    h1 {
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        color: #2c3e50;
        margin: 0;
    }

    .add-button {
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 1.5rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
        white-space: nowrap;
    }

    .add-button:hover {
        background-color: #219653;
    }

    .loading {
        text-align: center;
        font-size: 1.2rem;
        color: #7f8c8d;
        padding: 2rem;
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .warning-message {
        background-color: #fff3cd;
        color: #856404;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        border: 1px solid #ffeeba;
    }

    .empty-state {
        text-align: center;
        background-color: #f8f9fa;
        padding: 3rem;
        border-radius: 8px;
    }

    .cars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        padding: 0.5rem;
    }

    @media (max-width: 640px) {
        .cars-grid {
            grid-template-columns: 1fr;
            padding: 0;
        }

        .car-card {
            margin: 0.5rem 0;
        }
    }

    .car-card {
        background: white;
        border-radius: 8px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .car-header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .car-logo-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        flex-shrink: 0;
    }

    .car-logo {
        width: 50px;
        height: 50px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .edit-icon-button {
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        border: none;
        background-color: #17a2b8;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: background-color 0.2s, transform 0.15s;
    }

    .edit-icon-button:hover:not(:disabled) {
        background-color: #138496;
        transform: translateY(-1px);
    }

    .edit-icon-button:disabled {
        background-color: #adb5bd;
        cursor: not-allowed;
    }

    .car-title {
        flex: 1;
        min-width: 0;
    }

    .car-title h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
        font-weight: 600;
        word-break: break-word;
    }

    .car-title h4 {
        margin: 0.25rem 0 0 0;
        font-size: 1rem;
        color: #666;
        font-weight: 500;
        word-break: break-word;
    }

    .car-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .car-details p {
        margin: 0;
        color: #444;
        font-size: 0.95rem;
    }

    .parking-status {
        font-weight: 500;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        display: inline-block;
        font-size: 0.95rem;
        line-height: 1.2;
    }

    .parked {
        background-color: #ffe8cc;
        color: #7c4700;
        border: 1px solid #ffd8a8;
    }

    .not-parked {
        background-color: #f1f3f5;
        color: #495057;
        border: 1px solid #dee2e6;
    }

    .car-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }

    @media (max-width: 400px) {
        .car-actions {
            flex-direction: column;
        }

        .car-actions button {
            width: 100%;
        }
    }

    .park-button, .stop-button {
        flex: 1;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .park-button {
        background-color: #28a745;
        color: white;
    }

    .park-button:hover {
        background-color: #218838;
    }

    .stop-button {
        background-color: #ffc107;
        color: #000;
    }

    .stop-button:hover {
        background-color: #e0a800;
    }

    .delete-button {
        padding: 0.5rem 1rem;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .delete-button:hover {
        background-color: #c82333;
    }

    .delete-button:disabled {
        background-color: #adb5bd;
        cursor: not-allowed;
    }

    /* Modal styles */
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
        background-color: white;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin: 1rem;
    }

    @media (max-width: 640px) {
        .modal-content {
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
            width: 100%;
        }

        .modal-overlay {
            padding: 0;
        }
    }

    .modal-header {
        position: sticky;
        top: 0;
        background: white;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
        margin: 0;
        color: #2c3e50;
        font-size: clamp(1.2rem, 4vw, 1.5rem);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
        padding: 0.5rem;
        margin: -0.5rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    form {
        padding: 1rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: #34495e;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        -webkit-appearance: none;
        appearance: none;
    }

    input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .brand-autocomplete {
        position: relative;
    }

    .brand-suggestions {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        z-index: 1001;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        max-height: 260px;
        overflow-y: auto;
    }

    .brand-option {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        padding: 0.45rem 0.7rem;
        cursor: pointer;
    }

    .brand-option:hover,
    .brand-option.highlighted {
        background: #f6f8fa;
    }

    .brand-logo {
        width: 30px;
        height: 30px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .brand-name {
        color: #2c3e50;
        font-size: 1.05rem;
    }

    .field-hint {
        display: block;
        margin-top: 0.4rem;
        color: #6c757d;
        font-size: 0.85rem;
    }

    .field-hint.limit {
        color: #dc3545;
        font-weight: 600;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
        padding: 1rem;
        background: white;
        position: sticky;
        bottom: 0;
        border-top: 1px solid #e9ecef;
    }

    @media (max-width: 640px) {
        .form-actions {
            flex-direction: column-reverse;
        }

        .form-actions button {
            width: 100%;
            padding: 1rem;
        }
    }

    .parking-map-modal {
        max-width: 800px;
        width: 100%;
    }

    @media (max-width: 640px) {
        .parking-map-modal {
            height: 100vh;
            max-height: none;
            display: flex;
            flex-direction: column;
        }
    }

    .cancel-button {
        padding: 0.75rem 1.5rem;
        background-color: #e9ecef;
        color: #495057;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        min-height: 44px;
    }

    .submit-button {
        padding: 0.75rem 1.5rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        min-height: 44px;
    }

    .submit-button:hover:not(:disabled) {
        background-color: #2980b9;
    }

    .submit-button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
</style>
