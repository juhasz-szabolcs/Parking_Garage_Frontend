import { writable } from 'svelte/store';

// User authentication store
export const user = writable(null);
export const isAuthenticated = writable(false);

// Initialize from localStorage if available (for persistence)
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.set(JSON.parse(storedUser));
    isAuthenticated.set(true);
  }
}

// Update localStorage when user changes
user.subscribe(value => {
  if (typeof window !== 'undefined') {
    if (value) {
      localStorage.setItem('user', JSON.stringify(value));
      isAuthenticated.set(true);
    } else {
      localStorage.removeItem('user');
      isAuthenticated.set(false);
    }
  }
});