import Problem from "../models/problem.js";
import SiteConfig from "../models/siteConfig.js";

const DEFAULT_FEATURED_MODULES = [
  "problems",
  "revision-mentor",
  "mock-interview",
  "dsa-visualizer",
  "battle-lobby",
];

const normalizeFeaturedModules = (value) => {
  if (!Array.isArray(value)) {
    return DEFAULT_FEATURED_MODULES;
  }

  const filtered = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return filtered.length > 0 ? Array.from(new Set(filtered)) : DEFAULT_FEATURED_MODULES;
};

const getOrCreateSiteConfig = async () => {
  let config = await SiteConfig.findOne({ key: "default" }).populate(
    "dailyChallengeProblemId",
    "_id title difficulty tags"
  );

  if (!config) {
    config = await SiteConfig.create({ key: "default" });
    config = await config.populate("dailyChallengeProblemId", "_id title difficulty tags");
  }

  return config;
};

const serializeConfig = (config) => ({
  heroBadge: config.heroBadge,
  heroHeadline: config.heroHeadline,
  heroSubheadline: config.heroSubheadline,
  homepageFeaturedModules: normalizeFeaturedModules(config.homepageFeaturedModules),
  dailyChallenge: config.dailyChallengeProblemId
    ? {
        _id: config.dailyChallengeProblemId._id,
        title: config.dailyChallengeProblemId.title,
        difficulty: config.dailyChallengeProblemId.difficulty,
        tags: config.dailyChallengeProblemId.tags,
      }
    : null,
});

export const getPublicSiteContent = async (_req, res) => {
  try {
    const config = await getOrCreateSiteConfig();
    res.status(200).json(serializeConfig(config));
  } catch (error) {
    console.error("Failed to load public site content:", error);
    res.status(500).json({
      message: "Failed to load site content",
    });
  }
};

export const getAdminSiteContent = async (_req, res) => {
  try {
    const config = await getOrCreateSiteConfig();
    res.status(200).json(serializeConfig(config));
  } catch (error) {
    console.error("Failed to load admin site content:", error);
    res.status(500).json({
      message: "Failed to load admin site content",
    });
  }
};

export const updateAdminSiteContent = async (req, res) => {
  try {
    const {
      heroBadge,
      heroHeadline,
      heroSubheadline,
      dailyChallengeProblemId,
      homepageFeaturedModules,
    } = req.body;

    if (dailyChallengeProblemId) {
      const exists = await Problem.exists({ _id: dailyChallengeProblemId });
      if (!exists) {
        return res.status(404).json({
          message: "Daily challenge problem not found",
        });
      }
    }

    const config = await SiteConfig.findOneAndUpdate(
      { key: "default" },
      {
        key: "default",
        heroBadge:
          typeof heroBadge === "string" && heroBadge.trim()
            ? heroBadge.trim()
            : "Interview prep, reimagined",
        heroHeadline:
          typeof heroHeadline === "string" && heroHeadline.trim()
            ? heroHeadline.trim()
            : "Build interview momentum with CodeRax.",
        heroSubheadline:
          typeof heroSubheadline === "string" && heroSubheadline.trim()
            ? heroSubheadline.trim()
            : "Practice problems, sharpen concepts, battle live, and level up with an interface that feels like a real product.",
        dailyChallengeProblemId: dailyChallengeProblemId || null,
        homepageFeaturedModules: normalizeFeaturedModules(homepageFeaturedModules),
        updatedBy: req.result?._id || null,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).populate("dailyChallengeProblemId", "_id title difficulty tags");

    res.status(200).json({
      message: "Site content updated successfully",
      content: serializeConfig(config),
    });
  } catch (error) {
    console.error("Failed to update site content:", error);
    res.status(500).json({
      message: "Failed to update site content",
    });
  }
};
