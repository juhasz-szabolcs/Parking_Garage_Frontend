<script>
    // import { onMount } from "svelte";
    import { getUserData, createCar, startParking, stopParking } from "$lib/api";
    import { isAuthenticated, user } from "$lib/store";
    import { goto } from "$app/navigation";
    import ParkingMap from "$lib/components/ParkingMap.svelte";

    let cars = [];
    let ownedCars = [];
    let loading = true;
    let error = "";
    let success = "";
    let parkingSpots = [];
    // let activeParkings = new Map(); // Tárolja az aktív parkolásokat: carId -> parkingSpotId

    // New car form state
    let showModal = false;
    let newCar = {
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
    };
    let formLoading = false;

    let showParkingMap = false;
    let selectedCar = null;

    // Hardcoded car data
    const hardcodedCars = [
        {
            id: 1,
            brand: "Toyota",
            model: "Corolla",
            year: 2022,
            licensePlate: "ABC-123",
            color: "Kék",
            isOwn: true,
            logo: "https://www.carlogos.org/car-logos/toyota-logo.png",
            isParking: true,
        },
        {
            id: 2,
            brand: "Honda",
            model: "Civic",
            year: 2019,
            licensePlate: "DEF-456",
            color: "Red",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/honda-logo.png",
            isParking: false,
        },
        {
            id: 3,
            brand: "Ford",
            model: "Focus",
            year: 2020,
            licensePlate: "GHI-789",
            color: "Black",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/ford-logo.png",
            isParking: false,
        },
        {
            id: 4,
            brand: "BMW",
            model: "X5",
            year: 2021,
            licensePlate: "JKL-012",
            color: "Silver",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/bmw-logo.png",
            isParking: false,
        },
        {
            id: 5,
            brand: "Audi",
            model: "A4",
            year: 2001,
            licensePlate: "SU0-71J",
            color: "Szürke",
            isOwn: true,
            logo: "https://www.carlogos.org/car-logos/audi-logo.png",
            isParking: false,
        },
        {
            id: 6,
            brand: "Volkswagen",
            model: "Golf",
            year: 2022,
            licensePlate: "PQR-678",
            color: "Green",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/volkswagen-logo.png",
            isParking: false,
        },
        {
            id: 7,
            brand: "Mercedes",
            model: "C-Class",
            year: 2020,
            licensePlate: "STU-901",
            color: "Gray",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png",
            isParking: false,
        },
        {
            id: 8,
            brand: "Hyundai",
            model: "Tucson",
            year: 2019,
            licensePlate: "VWX-234",
            color: "Orange",
            isOwn: false,
            logo: "https://www.carlogos.org/car-logos/hyundai-logo.png",
            isParking: false,
        },
    ];

    // +++++++++
    import { onMount } from "svelte";

    onMount(async () => {
        if (!$user) {
            goto("/login");
            return;
        }
        await loadCars();
    });

    async function loadCars() {
        loading = true;
        error = "";

        try {
            const result = await getUserData();
            console.log("API response:", result);
            
            if (result.success) {
                cars = result.data.cars;
                ownedCars = cars;
                console.log("Loaded cars:", cars);
                cars.forEach(car => {
                    console.log(`Car ${car.brand} ${car.model} isParked:`, car.isParking);
                });
            } else {
                console.log("Using hardcoded data due to API error");
                cars = hardcodedCars;
                ownedCars = cars;
            }
        } catch (error) {
            console.error("Error loading cars:", error);
            cars = hardcodedCars;
            ownedCars = cars;
        } finally {
            loading = false;
        }
    }

    // Helper function to get car logo based on brand
    function getCarLogo(brand) {
        if (!brand) return 'https://www.carlogos.org/car-logos/default-car-logo.png';
        
        const brandLower = brand.toLowerCase();
        const logoMap = {
            'toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
            'honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
            'ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
            'bmw': 'https://www.carlogos.org/car-logos/bmw-logo.png',
            'audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
            'volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
            'mercedes': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
            'hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png'
        };
        return logoMap[brandLower] || 'https://www.carlogos.org/car-logos/default-car-logo.png';
    }
    // ////////////

    function openAddCarModal() {
        // Reset form
        newCar = {
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            licensePlate: "",
        };
        error = "";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    async function submitCarForm() {
        error = "";
        success = "";
        formLoading = true;

        // Validate form
        if (!newCar.brand || !newCar.model || !newCar.licensePlate) {
            error = "Kérjük, töltse ki az összes kötelező mezőt!";
            formLoading = false;
            return;
        }

        // Send to API
        const result = await createCar(newCar);

        if (result.success) {
            success = "Autó sikeresen hozzáadva!";
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
        }

        formLoading = false;
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
        try {
            const result = await stopParking(carId);
            if (result.success) {
                // Frissítjük az autók listáját
                await loadCars();
            } else {
                error = result.error || 'Hiba történt a parkolás leállítása során.';
            }
        } catch (error) {
            console.error('Error stopping parking:', error);
            error = 'Hiba történt a parkolás leállítása során.';
        }
    }

    function openParkingMap(car) {
        console.log('Opening parking map for car:', car);
        if (!car || !car.id || isNaN(car.id)) {
            console.error('Invalid car or car ID:', car);
            error = 'Érvénytelen autó kiválasztás!';
            return;
        }
        console.log('Car ID:', car.id);
        selectedCar = car;
        console.log('Selected car after assignment:', selectedCar);
        console.log('Selected car ID after assignment:', selectedCar?.id);
        showParkingMap = true;
    }

    function closeParkingMap() {
        showParkingMap = false;
        selectedCar = null;
    }

    async function handleSpotSelect(spot) {
        console.log('Selected car:', selectedCar);
        console.log('Selected spot:', spot);
        if (selectedCar && selectedCar.id) {
            console.log('Starting parking with carId:', selectedCar.id, 'and parkingSpotId:', spot.id);
            await handleStartParking(selectedCar.id, spot.id);
            closeParkingMap();
        } else {
            error = 'Nincs kiválasztva autó!';
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
    {:else if cars.length === 0}
        <div class="empty-state">
            <p>Még nincsenek autói. Adjon hozzá egy autót a kezdéshez!</p>
        </div>
    {:else}
        <div class="cars-grid">
            {#each ownedCars as car}
                <div class="car-card">
                    <div class="car-header">
                        <h3>{car.brand} {car.model}</h3>
                        <img
                            src={car.logo}
                            alt="{car.brand} logo"
                            width="40"
                            height="40"
                        />
                        <span class="license-plate">{car.licensePlate}</span>
                    </div>
                    <div class="car-info">
                        <p>Évjárat: {car.year}</p>
                        <p>Szín: {car.color}</p>
                    </div>
                    <div class="car-actions">
                        <button class="action-button edit">Szerkesztés</button>
                        {#if car.isParking}
                            <button
                                class="action-button park stop"
                                on:click={() => handleStopParking(car.id)}>
                                Parkolás leállítása
                            </button>
                        {:else}
                            <button
                                class="action-button park start"
                                on:click={() => openParkingMap(car)}>
                                Parkolás indítása
                            </button>
                        {/if}
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
                    <h2>Új autó hozzáadása</h2>
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
                        <input
                            type="text"
                            id="brand"
                            bind:value={newCar.brand}
                            placeholder="pl. Toyota"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="model">Modell*</label>
                        <input
                            type="text"
                            id="model"
                            bind:value={newCar.model}
                            placeholder="pl. Corolla"
                            required
                        />
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
                            required
                        />
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
                            {formLoading ? "Mentés..." : "Mentés"}
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
    .cars-container {
        max-width: 1000px;
        margin: 0 auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2.5rem;
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

    .empty-state {
        text-align: center;
        background-color: #f8f9fa;
        padding: 3rem;
        border-radius: 8px;
    }

    .cars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .car-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .car-header {
        background-color: #f8f9fa;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .car-header h3 {
        margin: 0;
        color: #2c3e50;
    }

    .license-plate {
        background-color: #e9ecef;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: bold;
    }

    .car-info {
        padding: 1rem;
    }

    .car-actions {
        display: flex;
        border-top: 1px solid #e9ecef;
    }

    .action-button {
        flex: 1;
        border: none;
        background: none;
        padding: 0.75rem;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.3s;
    }

    .action-button.edit {
        color: #3498db;
    }

    .action-button.edit:hover {
        background-color: #edf6fd;
    }

    .action-button.park.start {
        color: #27ae60;
    }
    
    .action-button.park.start:hover:not(:disabled) {
        background-color: #edfaf1;
    }
    
    .action-button.park.start:disabled {
        color: #95a5a6;
        cursor: not-allowed;
    }
    
    .action-button.park.stop {
        color: #e74c3c;
    }
    
    .action-button.park.stop:hover {
        background-color: #fdf0f0;
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
    }

    .modal-content {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
        margin: 0;
        color: #2c3e50;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
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
    }

    input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
    }

    .cancel-button {
        padding: 0.75rem 1.5rem;
        background-color: #e9ecef;
        color: #495057;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .submit-button {
        padding: 0.75rem 1.5rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .submit-button:hover:not(:disabled) {
        background-color: #2980b9;
    }

    .submit-button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    .parking-map-modal {
        max-width: 800px;
        width: 90%;
    }
</style>
