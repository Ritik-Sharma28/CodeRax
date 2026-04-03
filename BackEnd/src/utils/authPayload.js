export const isUserVerified = (user) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.verified !== false;
};

export const getAuthProvider = (user) => {
    if (!user) return "local";
    if (user.authProvider) return user.authProvider;
    if (user.googleId && user.password) return "hybrid";
    if (user.googleId) return "google";
    return "local";
};

export const buildAuthReply = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId,
    _id: user._id,
    role: user.role,
    profilePicture: user.profilePicture,
    rating: user.rating,
    rank: user.rank,
    mockInterviewUseLeft: user.mockInterviewUseLeft,
    aiChatMsgsLeft: user.aiChatMsgsLeft,
    revisionMsgsLeft: user.revisionMsgsLeft,
    verified: isUserVerified(user),
    authProvider: getAuthProvider(user),
});
