import axiosClient from './axiosClient';

const matchService = {
    createMatch: async (data) => {
        const response = await axiosClient.post('/api/match/create', data);
        return response.data;
    },

    joinMatch: async (matchId) => {
        const response = await axiosClient.post('/api/match/join', { matchId });
        return response.data;
    },

    getMatch: async (matchId) => {
        const response = await axiosClient.get(`/api/match/${matchId}`);
        return response.data;
    },

    queueMatch: async (rating) => {
        const response = await axiosClient.post('/api/match/queue', { rating });
        return response.data;
    },
    getQueueStatus: async () => {
        const response = await axiosClient.get('/api/match/queue-status');
        return response.data;
    },
    cancelQueue: async () => {
        const response = await axiosClient.post('/api/match/cancel-queue');
        return response.data;
    },
    submitFinal: async (matchId) => {
        const response = await axiosClient.post(`/api/match/${matchId}/submit-final`);
        return response.data;
    },
    finishMatch: async (matchId) => {
        const response = await axiosClient.post(`/api/match/${matchId}/finish`);
        return response.data;
    },

    uploadProfilePicture: async (formData) => {
        const response = await axiosClient.post('/api/user/profile-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getUserProfile: async (userId) => {
        const response = await axiosClient.get(`/api/user/profile/${userId}`);
        return response.data;
    }
};

export default matchService;
