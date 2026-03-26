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
// axiosClient.interceptors.response.use(

//   (response) => response,

//   (error) => {
//     return Promise.reject(error.response?.data || error);
//   }

// );



export default axiosClient;