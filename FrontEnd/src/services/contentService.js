import axiosClient from "./axiosClient";

const contentService = {
    getPublicContent: async () => {
        const response = await axiosClient.get("/api/content/public");
        return response.data;
    },
    getAdminContent: async () => {
        const response = await axiosClient.get("/api/content/admin");
        return response.data;
    },
    updateAdminContent: async (payload) => {
        const response = await axiosClient.put("/api/content/admin", payload);
        return response.data;
    },
};

export default contentService;
