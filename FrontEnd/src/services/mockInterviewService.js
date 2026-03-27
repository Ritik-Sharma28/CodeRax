import axiosClient from "./axiosClient";

const mockInterviewService = {
  async generateLiveToken(config) {
    const response = await axiosClient.post("/ai/interview/live-token", config);
    return response.data;
  },

  async gradeInterview(payload) {
    const response = await axiosClient.post("/ai/interview/grade", payload);
    return response.data;
  },

  async saveInterviewSession(payload) {
    const response = await axiosClient.post("/ai/interview/session", payload);
    return response.data;
  },
};

export default mockInterviewService;
