
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://taskmanagerapi-production-18aa.up.railway.app/api/tasks',
    timeout: 10000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Here we can log errors or handle global error states if needed
        // For now, we just reject the promise to let components handle specific codes
        return Promise.reject(error);
    }
);

export default api;
