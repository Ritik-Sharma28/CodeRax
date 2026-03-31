import Problem from "../models/problem.js";
import SiteConfig from "../models/siteConfig.js";
import { Submission } from "../models/submission.js";

const getDateKey = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
};

const computeStreaks = (dates) => {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = Array.from(new Set(dates)).sort((a, b) => new Date(b) - new Date(a));
  let longestStreak = 1;
  let running = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const current = new Date(sortedDates[index - 1]);
    const next = new Date(sortedDates[index]);
    const diffDays = Math.round((current - next) / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else if (diffDays > 1) {
      running = 1;
    }
  }

  const todayKey = getDateKey(new Date());
  const yesterdayKey = getDateKey(Date.now() - 24 * 60 * 60 * 1000);
  let currentStreak = 0;

  if (sortedDates[0] === todayKey || sortedDates[0] === yesterdayKey) {
    currentStreak = 1;
    for (let index = 1; index < sortedDates.length; index += 1) {
      const prev = new Date(sortedDates[index - 1]);
      const next = new Date(sortedDates[index]);
      const diffDays = Math.round((prev - next) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

const getFallbackProblem = (problems, solvedSet, preferredDifficulties) => {
  for (const difficulty of preferredDifficulties) {
    const found = problems.find(
      (problem) => problem.difficulty === difficulty && !solvedSet.has(problem._id.toString())
    );
    if (found) {
      return found;
    }
  }

  return problems.find((problem) => !solvedSet.has(problem._id.toString())) || null;
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.result._id;

    const [allProblems, acceptedSubmissions, latestAttempts, siteConfig] = await Promise.all([
      Problem.find({}).select("_id title difficulty tags").lean(),
      Submission.find({ userId, status: "Accepted" })
        .sort({ createdAt: -1 })
        .populate("problemId", "_id title difficulty tags")
        .lean(),
      Submission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("problemId", "_id title difficulty tags")
        .lean(),
      SiteConfig.findOne({ key: "default" })
        .populate("dailyChallengeProblemId", "_id title difficulty tags")
        .lean(),
    ]);

    const solvedSet = new Set((req.result.problemSolved || []).map((problemId) => problemId.toString()));
    const totalProblems = allProblems.length;

    const difficultyProgress = ["easy", "medium", "hard"].reduce((accumulator, difficulty) => {
      const total = allProblems.filter((problem) => problem.difficulty === difficulty).length;
      const solved = allProblems.filter(
        (problem) => problem.difficulty === difficulty && solvedSet.has(problem._id.toString())
      ).length;

      accumulator[difficulty] = { total, solved };
      return accumulator;
    }, {});

    const uniqueAcceptedDates = acceptedSubmissions.map((submission) => getDateKey(submission.createdAt));
    const { currentStreak, longestStreak } = computeStreaks(uniqueAcceptedDates);

    const recentSolvedMap = new Map();
    acceptedSubmissions.forEach((submission) => {
      const problem = submission.problemId;
      if (!problem?._id || recentSolvedMap.has(problem._id.toString())) {
        return;
      }

      recentSolvedMap.set(problem._id.toString(), {
        problemId: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
        solvedAt: submission.createdAt,
      });
    });

    const recentSolved = Array.from(recentSolvedMap.values()).slice(0, 6);
    const weeklySolvedCount = recentSolved.filter((item) => {
      const solvedAt = new Date(item.solvedAt).getTime();
      return solvedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000;
    }).length;

    const recentAttempt = latestAttempts.find((submission) => {
      const problem = submission.problemId;
      return problem?._id && !solvedSet.has(problem._id.toString());
    });

    const continueProblem =
      recentAttempt?.problemId ||
      getFallbackProblem(allProblems, solvedSet, ["medium", "easy", "hard"]);

    const dailyChallenge = siteConfig?.dailyChallengeProblemId || null;

    res.status(200).json({
      currentStreak,
      longestStreak,
      solvedTotal: solvedSet.size,
      weeklySolvedCount,
      totalProblems,
      difficultyProgress,
      recentSolved,
      continueProblem: continueProblem
        ? {
            problemId: continueProblem._id,
            title: continueProblem.title,
            difficulty: continueProblem.difficulty,
            tags: continueProblem.tags,
          }
        : null,
      dailyChallenge: dailyChallenge
        ? {
            problemId: dailyChallenge._id,
            title: dailyChallenge.title,
            difficulty: dailyChallenge.difficulty,
            tags: dailyChallenge.tags,
          }
        : null,
      battleSnapshot: {
        rating: req.result.rating || 1200,
        rank: req.result.rank || "Bronze",
        matchesPlayed: req.result.matchesPlayed || 0,
        matchesWon: req.result.matchesWon || 0,
        winRate:
          req.result.matchesPlayed > 0
            ? Number(((req.result.matchesWon / req.result.matchesPlayed) * 100).toFixed(1))
            : 0,
      },
    });
  } catch (error) {
    console.error("Failed to build dashboard summary:", error);
    res.status(500).json({
      message: "Failed to load dashboard summary",
    });
  }
};
