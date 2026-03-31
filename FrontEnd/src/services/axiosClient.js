import axios from "axios"

const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : `http://${window.location.hostname}:3000`;

const axiosClient =  axios.create({
    baseURL: backendUrl,
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
