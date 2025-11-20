import axios, { type AxiosRequestConfig } from "axios";

// Create a base instance
export const AXIOS_INSTANCE = axios.create({
  baseURL: "http://localhost:3000", // Point to your NestJS server
});

// Add interceptors for JWT tokens here
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Or however you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// This is the function Orval will use to make requests
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data);
};
