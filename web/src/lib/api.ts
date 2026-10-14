import axios from 'axios';
import { tokenStorage } from '../auth/token';


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ANTES DE CADA PETICION SI HAY TOKEN SE AGREGA
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config;
});


// DESPUES DE CADA RESPUESTA SI LA API DICE 401 EL TOKEN YA NO SIRVE

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }

  if (axios.isAxiosError(error) && !error.response) return 'No se pudo conectar con el servidor';
  return 'Ocurrió un error inesperado';
};





