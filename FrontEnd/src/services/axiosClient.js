import axios from "axios"
import { getApiBaseUrl } from "./apiBaseUrl";
import { openVerificationModal } from "./slices/uiSlice";

let storeRef = null;

export const attachAxiosStore = (store) => {
  storeRef = store;
};

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
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 403 && data?.error === "verification_required" && storeRef && String(error?.config?.url || "").startsWith("/ai")) {
      storeRef.dispatch(openVerificationModal({ message: data?.message }));
    }

    const message =
      data?.message ||
      data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({
      ...error,
      message,
      data,
      status,
    });
  }
);



export default axiosClient;
