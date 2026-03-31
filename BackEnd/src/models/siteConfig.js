import mongoose from "mongoose";

const { Schema } = mongoose;

const siteConfigSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "default",
    },
    heroBadge: {
      type: String,
      default: "Interview prep, reimagined",
    },
    heroHeadline: {
      type: String,
      default: "Build interview momentum with CodeRax.",
    },
    heroSubheadline: {
      type: String,
      default:
        "Practice problems, sharpen concepts, battle live, and level up with an interface that feels like a real product.",
    },
    dailyChallengeProblemId: {
      type: Schema.Types.ObjectId,
      ref: "problem",
      default: null,
    },
    homepageFeaturedModules: {
      type: [String],
      default: ["problems", "revision-mentor", "dsa-visualizer", "battle-lobby"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SiteConfig = mongoose.model("siteConfig", siteConfigSchema);

export default SiteConfig;
