import axiosClient from './axiosClient';

const problemService = {
    getAllProblems: async () => {
        const response = await axiosClient.get('/problem/getAllProblem');
        return response.data;
    },

    getProblemById: async (id) => {
        const response = await axiosClient.get(`/problem/problemById/${id}`);
        return response.data;
    },

    getSolvedProblems: async () => {
        const response = await axiosClient.get('/problem/problemSolvedByUser');
        return response.data;
    },

    createProblem: async (problemData) => {
        const response = await axiosClient.post('/problem/create', problemData);
        return response.data;
    },

    updateProblem: async (id, problemData) => {
        const response = await axiosClient.put(`/problem/update/${id}`, problemData);
        return response.data;
    },

    deleteProblem: async (id) => {
        const response = await axiosClient.delete(`/problem/delete/${id}`);
        return response.data;
    },

    // Video Capabilities
    generateUploadSignature: async (problemId) => {
        const response = await axiosClient.get(`/video/create/${problemId}`);
        return response.data;
    },

    saveVideoLocalFallback: async (videoData) => {
        const response = await axiosClient.post('/video/save-local', videoData);
        return response.data;
    },

    getVideoData: async (problemId) => {
        const response = await axiosClient.get(`/video/${problemId}`);
        return response.data;
    },

    deleteVideo: async (problemId) => {
        const response = await axiosClient.delete(`/video/delete/${problemId}`);
        return response.data;
    }
};

export default problemService;
