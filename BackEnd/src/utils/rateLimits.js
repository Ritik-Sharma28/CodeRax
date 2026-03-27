export const resetLimitsIfNewDay = async (user) => {
    if (user.role === 'admin') return;

    const today = new Date().toDateString();
    const lastReset = user.lastLimitResetDate ? new Date(user.lastLimitResetDate).toDateString() : "";

    if (today !== lastReset) {
        user.mockInterviewUseLeft = 2;
        user.aiChatMsgsLeft = 10;
        user.revisionMsgsLeft = 5;
        user.lastLimitResetDate = new Date();
        await user.save();
    }
};
