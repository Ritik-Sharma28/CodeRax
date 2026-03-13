import axiosClient from './axiosClient';

const submissionService = {
    runCode: async (problemId, data) => {
        const response = await axiosClient.post(`/submission/run/${problemId}`, data);
        return response.data;
    },

    submitCode: async (problemId, data) => {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, data);
        return response.data;
    },

    getAllSubmissions: async (problemId) => {
        const response = await axiosClient.get(`/submission/all/${problemId}`);
        return response.data;
    }
};

export default submissionService;
