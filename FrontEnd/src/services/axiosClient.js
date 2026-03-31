import axios from "axios"
import { getApiBaseUrl } from "./apiBaseUrl";

const axiosClient =  axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({
      ...error,
      message,
      data: error?.response?.data,
      status: error?.response?.status,
    });
  }
);



export default axiosClient;
