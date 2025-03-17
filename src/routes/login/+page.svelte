<script>
    import { login } from '$lib/api';
    import { user } from '$lib/store';
    import { goto } from '$app/navigation';
    
    let email = '';
    let password = '';
    let error = '';
    let loading = false;
    
    async function handleSubmit() {
      error = '';
      loading = true;
      
      if (!email || !password) {
        error = 'Kérjük, töltse ki mindkét mezőt!';
        loading = false;
        return;
      }
      
      const result = await login(email, password);
      
      if (result.success) {
        $user = result.data;
        goto('/dashboard');
      } else {
        error = typeof result.error === 'string' 
          ? result.error 
          : 'Sikertelen bejelentkezés. Kérjük, ellenőrizze az e-mail címet és a jelszót.';
      }
      
      loading = false;
    }
  </script>
  
  <div class="login-container">
    <div class="form-card">
      <h1>Bejelentkezés</h1>
      
      {#if error}
        <div class="error-message">{error}</div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="email">E-mail cím</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            placeholder="pelda@email.com"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Jelszó</label>
          <input 
            type="password" 
            id="password" 
            bind:value={password}
            required
          />
        </div>
        
        <button type="submit" class="submit-button" disabled={loading}>
          {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
        </button>
      </form>
      
      <div class="form-footer">
        <p>Még nincs fiókja? <a href="/register">Regisztráljon itt</a></p>
      </div>
    </div>
  </div>
  
  <style>
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
    }
    
    .form-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 450px;
    }
    
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
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
    
    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2980b9;
    }
    
    .submit-button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }
    
    .form-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }
    
    .form-footer a {
      color: #3498db;
      text-decoration: none;
    }
    
    .form-footer a:hover {
      text-decoration: underline;
    }
  </style>