//Este archivo centraliza axioss para todas las peticiones HTTP al backend
//Configura la URL base y el tiempo maximo de espera desde as constantes
//Interceptor de peticion: Adjunta automaticamente el token JWT si existe
//Interceptor de respuesta: Normaliza los errores para que todo el codigo recibasiempre un objeto de Error con un mensaje legible
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS } from '../utils/constants';
import { storageGetItem } from '../utils/storage';

//Instancias de axios
const apiClient = axios.create({
    baseURL: API_URL, //La base de url que se conecta con el backend
    timeOut: API_TIMEOUT_MS, //tiempo maximo de espera, se cancela si el servidor no responde o tarda demasiado

});

//Interceptor de peticion: se ejecuta antes de enviar cada request
//Si hay token lo valida
//Autorizacion oara que el backend pueda autenticar usuarios

apiClient.interceptors.request.use(
    async (config) => {
        const token = await storageGetItem(STORAGE_KEYS.token);
        if (token) {
            // Formato estandar Bearer autorizacion: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    //Si el interceptos mismo falla (error de configuracion) rechaza la peticion
    (error) => Promise.reject(error)
);

//Interceptor de respuesta: se ejecuta despues de recibir la respuesta del sevidor
//Respuestas 2xx se devuelven sin modificar
//Respuestas con error 4xx o 5xx /red extrae el mensaje del backend
//Si existe si no usa el mensaje de axios o un mensaje generico

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const backendMessage = error.response?.data?.message; //mensaje del servidor
        const message = backendMessage || error.message || 'Error de conexion';
        return Promise.reject(new Error(message));        
    }
);

export default apiClient;