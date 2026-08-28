import axios from 'axios';

const api = axios.create({

    baseURL: 'https://backend-insumed-lhac.vercel.app'

});


api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    console.log("TOKEN ENVIADO:", token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


export default api;