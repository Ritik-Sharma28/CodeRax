const RANKED_QUEUE_KEY = "ranked_queue";
const PENDING_MATCH_TTL_SECONDS = 300;

const normalizeUserId = (userId) => String(userId);

export const buildQueueEntryValue = ({ userId, rating, timestamp = Date.now() }) =>
  JSON.stringify({
    userId: normalizeUserId(userId),
    rating: Number(rating) || 1200,
    timestamp,
  });

export const parseQueueEntryValue = (value) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed?.userId) {
      return {
        raw: value,
        userId: normalizeUserId(parsed.userId),
        rating: Number(parsed.rating) || null,
        timestamp: Number(parsed.timestamp) || null,
      };
    }
  } catch {
    // Backward compatibility for any stale plain-string entries.
  }

  return {
    raw: value,
    userId: normalizeUserId(value),
    rating: null,
    timestamp: null,
  };
};

export const findQueueEntryByUserId = async (redisClient, userId) => {
  if (!redisClient?.isReady) return null;

  const normalizedUserId = normalizeUserId(userId);
  const queueValues = await redisClient.zRange(RANKED_QUEUE_KEY, 0, -1);

  for (const value of queueValues) {
    const parsed = parseQueueEntryValue(value);
    if (parsed?.userId === normalizedUserId) {
      return parsed;
    }
  }

  return null;
};

export const removeUserFromRankedQueue = async (redisClient, userId) => {
  if (!redisClient?.isReady) return false;

  const entry = await findQueueEntryByUserId(redisClient, userId);
  if (!entry?.raw) return false;

  await redisClient.zRem(RANKED_QUEUE_KEY, [entry.raw]);
  return true;
};

const getPendingMatchKey = (userId) => `pending_match:${normalizeUserId(userId)}`;

export const setPendingMatch = async (redisClient, userId, matchId) => {
  if (!redisClient?.isReady) return;

  const payload = JSON.stringify({
    matchId,
    createdAt: Date.now(),
  });

  await redisClient.set(getPendingMatchKey(userId), payload, {
    EX: PENDING_MATCH_TTL_SECONDS,
  });
};

export const getPendingMatch = async (redisClient, userId) => {
  if (!redisClient?.isReady) return null;

  const value = await redisClient.get(getPendingMatchKey(userId));
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed?.matchId) {
      return {
        matchId: parsed.matchId,
        createdAt: Number(parsed.createdAt) || null,
      };
    }
  } catch {
    return {
      matchId: value,
      createdAt: null,
    };
  }

  return null;
};

export const clearPendingMatch = async (redisClient, userId) => {
  if (!redisClient?.isReady) return;
  await redisClient.del(getPendingMatchKey(userId));
};

export { PENDING_MATCH_TTL_SECONDS, RANKED_QUEUE_KEY };
