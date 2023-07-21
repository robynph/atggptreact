import axios from 'axios';

const axiosInstance = (token) => {
  const instance = axios.create();

  instance.interceptors.request.use(
    (config) => {
      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosInstance;
