import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'

// Global Fetch Interceptor to inject JWT Auth Token
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const isApiCall = typeof url === 'string' && url.includes('/api/');
    const isForm = options.body instanceof FormData;
    
    if (token && isApiCall) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            ...(!isForm && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {})
        };
    }
    return originalFetch(url, options);
};
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
