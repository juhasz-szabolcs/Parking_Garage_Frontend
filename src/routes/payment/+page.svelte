<script>
    import { goto } from "$app/navigation";
    import { formatLicensePlate } from "$lib/utils/licensePlate";
    
    // Hardcoded payment details
    let parkingDetails = {
        licensePlate: "SU-071JZ",
        carModel: "Toyota Corolla",
        startTime: "2025-03-16:30",
        endTime: "2025-03-19 19:22",
        duration: "2 óra 52 perc",
        baseRate: 250,
        hourlyRate: 300,
        totalAmount: 1150
    };
    
    let selectedPaymentMethod = null;
    let processingPayment = false;
    let paymentComplete = false;
    let paymentError = false;
    
    function selectPaymentMethod(method) {
        selectedPaymentMethod = method;
    }
    
    function processPayment() {
        if (!selectedPaymentMethod) {
            alert("Kérjük válasszon fizetési módot!");
            return;
        }
        
        processingPayment = true;
        
        // Simulate payment processing
        setTimeout(() => {
            processingPayment = false;
            paymentComplete = true;
            
            // After successful payment, redirect to dashboard after 3 seconds
            setTimeout(() => {
                goto("/dashboard");
            }, 3000);
        }, 2000);
    }
</script>

<div class="payment-container">
    <h1>Parkolási díj fizetése</h1>
    
    <div class="payment-details">
        <h2>Parkolási adatok</h2>
        <div class="details-grid">
            <div class="detail-item">
                <span class="label">Rendszám:</span>
                <span class="value">{formatLicensePlate(parkingDetails.licensePlate)}</span>
            </div>
            <div class="detail-item">
                <span class="label">Gépjármű:</span>
                <span class="value">{parkingDetails.carModel}</span>
            </div>
            <div class="detail-item">
                <span class="label">Parkolás kezdete:</span>
                <span class="value">{parkingDetails.startTime}</span>
            </div>
            <div class="detail-item">
                <span class="label">Parkolás vége:</span>
                <span class="value">{parkingDetails.endTime}</span>
            </div>
            <div class="detail-item">
                <span class="label">Időtartam:</span>
                <span class="value">{parkingDetails.duration}</span>
            </div>
        </div>
        
        <div class="cost-breakdown">
            <h3>Díjszámítás</h3>
            <div class="cost-item">
                <span>Alapdíj:</span>
                <span>{parkingDetails.baseRate} Ft</span>
            </div>
            <div class="cost-item">
                <span>Óradíj (300Ft/óra) -  {1+Math.ceil(parkingDetails.duration.split(' ')[0])} óra:</span>
                <!-- <span>{parkingDetails.hourlyRate * Math.ceil(parkingDetails.duration.split(' ')[0])} Ft</span> -->
                <span>{300 * 3} Ft</span>
            </div>
            <div class="cost-item total">
                <span>Fizetendő összesen:</span>
                <span>{parkingDetails.totalAmount} Ft</span>
            </div>
        </div>
    </div>
    
    {#if !paymentComplete}
        <div class="payment-methods">
            <h2>Fizetési mód kiválasztása</h2>
            
            <div class="payment-options">
                <div 
                    class="payment-option {selectedPaymentMethod === 'paypal' ? 'selected' : ''}"
                    on:click={() => selectPaymentMethod('paypal')}
                >
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" class="payment-logo paypal-logo">
                    <span>PayPal</span>
                </div>
                
                <div 
                    class="payment-option {selectedPaymentMethod === 'card' ? 'selected' : ''}"
                    on:click={() => selectPaymentMethod('card')}
                >
                    <div class="card-logos">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCh6Wx6nJ-dsryg_GQMfYy7STmrwy7DtaaXw&s" alt="Mastercard" class="payment-logo card-logo">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu7AqFeDiemCjLqtzvlZHHCr36vzhCAJolcg&s" alt="Visa" class="payment-logo card-logo">
                    </div>
                    <span>Bankkártyás fizetés</span>
                </div>
            </div>
            
            <div class="payment-actions">
                <button class="button secondary" on:click={() => goto('/dashboard')}>Vissza</button>
                <button 
                    class="button primary" 
                    on:click={processPayment}
                    disabled={!selectedPaymentMethod || processingPayment}
                >
                    {#if processingPayment}
                        Feldolgozás...
                    {:else}
                        Fizetés {parkingDetails.totalAmount} Ft
                    {/if}
                </button>
            </div>
        </div>
    {:else}
        <div class="payment-success">
            <div class="success-icon">✓</div>
            <h2>Sikeres fizetés!</h2>
            <p>A parkolási díj ({parkingDetails.totalAmount} Ft) sikeresen kiegyenlítve.</p>
            <p>Hamarosan átirányítjuk a főoldalra...</p>
        </div>
    {/if}
    
    <div class="secure-payment-notice">
        <i class="lock-icon">🔒</i>
        <span>Biztonságos fizetés. Az Ön adatait titkosítva kezeljük.</span>
    </div>
</div>

<style>
    .payment-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
        text-align: center;
        margin-bottom: 2rem;
        color: #2c3e50;
    }
    
    .payment-details {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: #f8f9fa;
        border-radius: 6px;
    }
    
    .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
    }
    
    .label {
        font-weight: 600;
        color: #6c757d;
    }
    
    .cost-breakdown {
        border-top: 1px solid #dee2e6;
        padding-top: 1rem;
    }
    
    .cost-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .total {
        font-weight: 700;
        font-size: 1.2rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px dashed #dee2e6;
    }
    
    .payment-methods {
        margin-bottom: 2rem;
    }
    
    .payment-options {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .payment-option {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .payment-option:hover {
        border-color: #6c757d;
    }
    
    .payment-option.selected {
        border-color: #007bff;
        background-color: rgba(0, 123, 255, 0.05);
    }
    
    .payment-logo {
        margin-bottom: 1rem;
        max-height: 50px;
    }
    
    .card-logos {
        display: flex;
        gap: 1rem;
    }
    
    .card-logo {
        max-height: 40px;
    }
    
    .payment-actions {
        display: flex;
        justify-content: space-between;
    }
    
    .button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .button.primary {
        background-color: #007bff;
        color: white;
    }
    
    .button.primary:hover {
        background-color: #0069d9;
    }
    
    .button.primary:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
    
    .button.secondary {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #495057;
    }
    
    .button.secondary:hover {
        background-color: #e9ecef;
    }
    
    .payment-success {
        text-align: center;
        padding: 2rem;
    }
    
    .success-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background-color: #28a745;
        color: white;
        font-size: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
    }
    
    .secure-payment-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 2rem;
        color: #6c757d;
        font-size: 0.9rem;
    }
    
    .lock-icon {
        font-style: normal;
    }
</style>