import "dotenv/config";
import mongoose from "mongoose";
import main from "../config/db.js";
import Problem from "../models/problem.js";
import User from "../models/user.js";

const javaType = (t) => {
  const m = { "int":"int", "long long":"long", "double":"double", "bool":"boolean",
    "string":"String", "vector<int>":"int[]", "vector<string>":"String[]",
    "vector<vector<int>>":"int[][]", "ListNode*":"ListNode", "TreeNode*":"TreeNode" };
  return m[t] || t;
};

export const makeStartCode = (sig, lang) => {
  const { functionName, returnType, args } = sig;
  if (lang === "cpp") {
    const al = args.map(a => `${a.type} ${a.name}`).join(", ");
    return `class Solution {\npublic:\n    ${returnType} ${functionName}(${al}) {\n        // Write your logic here\n    }\n};`;
  }
  if (lang === "python") {
    const al = args.map(a => a.name).join(", ");
    return `class Solution:\n    def ${functionName}(self, ${al}):\n        # Write your logic here\n        pass`;
  }
  if (lang === "java") {
    const al = args.map(a => `${javaType(a.type)} ${a.name}`).join(", ");
    return `class Solution {\n    public ${javaType(returnType)} ${functionName}(${al}) {\n        // Write your logic here\n    }\n}`;
  }
};

export const mk = ({ title, difficulty, tags, description, signature, visible, hidden,
  cppRef, pyRef, javaRef, judgeConfig = { outputMode: "token", floatTolerance: 0.000001 } }) => ({
  title, description, difficulty, tags, judgeConfig,
  problemSignature: signature,
  visibleTestCases: visible,
  hiddenTestCases: hidden,
  startCode: [
    { language: "cpp", initialCode: makeStartCode(signature, "cpp") },
    { language: "python", initialCode: makeStartCode(signature, "python") },
    { language: "java", initialCode: makeStartCode(signature, "java") },
  ],
  referenceSolution: [
    { language: "cpp", completeCode: cppRef },
    { language: "python", completeCode: pyRef },
    { language: "java", completeCode: javaRef },
  ],
});

export const runSeed = async (problems) => {
  await main();
  const admin = await User.findOne({ role: "admin" }).select("_id");
  const user = admin || (await User.findOne({}).select("_id"));
  if (!user) throw new Error("No user found. Create at least one user/admin before seeding.");
  let count = 0;
  for (const p of problems) {
    await Problem.updateOne({ title: p.title }, { $set: { ...p, problemCreator: user._id } }, { upsert: true });
    count++;
  }
  console.log(`Seeded/updated ${count} problems successfully.`);
  await mongoose.connection.close();
};

export const runSeedCli = (problems) => {
  runSeed(problems).catch(async (err) => {
    console.error("Seed failed:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  });
};
