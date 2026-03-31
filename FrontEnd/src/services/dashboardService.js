import axiosClient from "./axiosClient";

const dashboardService = {
    getSummary: async () => {
        const response = await axiosClient.get("/api/user/dashboard-summary");
        return response.data;
    },
};

export default dashboardService;
