const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const apiFetch = (url, options = {}, schoolId) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'x-school-id': schoolId,
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });
};

export { API_BASE };
