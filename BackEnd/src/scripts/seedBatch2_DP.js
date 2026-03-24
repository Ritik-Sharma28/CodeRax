import { mk, runSeedCli } from "../utils/seedHelper.js";

const problems = [
    // ─────────────────────────────────────────────
    // 1. Maximum Subarray Sum
    // ─────────────────────────────────────────────
    mk({
        title: "Maximum Subarray Sum",
        difficulty: "medium",
        tags: "dp",
        description: `Given an integer array \`nums\`, return the maximum possible sum of any non-empty contiguous subarray.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers

**Output format:**
- A single integer — the maximum subarray sum.

**Constraints:**
- 1 <= n <= 10^5
- -10^4 <= nums[i] <= 10^4`,
        signature: {
            functionName: "maxSubArray",
            returnType: "int",
            args: [{ name: "nums", type: "vector<int>" }],
        },
        visible: [
            {
                input: "9\n-2 1 -3 4 -1 2 1 -5 4",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
            },
            {
                input: "1\n1",
                output: "1",
                explanation: "Only one element, so the answer is 1.",
            },
        ],
        hidden: [
            { input: "5\n-8 -3 -6 -2 -5", output: "-2" },
            { input: "3\n5 -1 5", output: "9" },
            { input: "6\n1 2 3 -10 5 6", output: "11" },
        ],
        cppRef: `class Solution {
public:
    int maxSubArray(vector<int> nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`,
        pyRef: `class Solution:
    def maxSubArray(self, nums):
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best`,
        javaRef: `class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 2. Climb Stairs Ways
    // ─────────────────────────────────────────────
    mk({
        title: "Climb Stairs Ways",
        difficulty: "easy",
        tags: "dp",
        description: `You are climbing a staircase with \`n\` steps. Each time you can climb 1 or 2 steps. Return the number of distinct ways to reach the top.

**Input format (per test case):**
- A single integer n.

**Output format:**
- A single integer — the number of distinct ways.

**Constraints:**
- 1 <= n <= 45`,
        signature: {
            functionName: "climbStairs",
            returnType: "int",
            args: [{ name: "n", type: "int" }],
        },
        visible: [
            {
                input: "2",
                output: "2",
                explanation: "Two ways: (1+1) or (2).",
            },
            {
                input: "3",
                output: "3",
                explanation: "Three ways: (1+1+1), (1+2), (2+1).",
            },
        ],
        hidden: [
            { input: "1", output: "1" },
            { input: "10", output: "89" },
            { input: "20", output: "10946" },
        ],
        cppRef: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b; b = c;
        }
        return b;
    }
};`,
        pyRef: `class Solution:
    def climbStairs(self, n):
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`,
        javaRef: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b; b = c;
        }
        return b;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 3. Coin Change Minimum Coins
    // ─────────────────────────────────────────────
    mk({
        title: "Coin Change Minimum Coins",
        difficulty: "medium",
        tags: "dp",
        description: `Given an array of coin denominations \`coins\` and an integer \`amount\`, return the minimum number of coins needed to make up that amount. If it is impossible, return \`-1\`.

You may use each coin denomination an unlimited number of times.

**Input format (per test case):**
- First line: n (number of denominations)
- Second line: n space-separated positive integers (the coin values)
- Third line: amount (the target amount)

**Output format:**
- A single integer — the minimum number of coins, or -1 if impossible.

**Constraints:**
- 1 <= n <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4`,
        signature: {
            functionName: "coinChange",
            returnType: "int",
            args: [
                { name: "coins", type: "vector<int>" },
                { name: "amount", type: "int" },
            ],
        },
        visible: [
            {
                input: "3\n1 2 5\n11",
                output: "3",
                explanation: "11 = 5 + 5 + 1, which uses 3 coins.",
            },
            {
                input: "1\n2\n3",
                output: "-1",
                explanation: "Amount 3 cannot be made using only coin 2.",
            },
        ],
        hidden: [
            { input: "4\n1 3 4 5\n7", output: "2" },
            { input: "1\n1\n0", output: "0" },
            { input: "2\n1 5\n6", output: "2" },
        ],
        cppRef: `class Solution {
public:
    int coinChange(vector<int> coins, int amount) {
        const int INF = 1e9;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) if (a >= c) dp[a] = min(dp[a], dp[a - c] + 1);
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }
};`,
        pyRef: `class Solution:
    def coinChange(self, coins, amount):
        INF = 10**9
        dp = [INF] * (amount + 1)
        dp[0] = 0
        for a in range(1, amount + 1):
            for c in coins:
                if a >= c:
                    dp[a] = min(dp[a], dp[a - c] + 1)
        return -1 if dp[amount] >= INF else dp[amount]`,
        javaRef: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int INF = (int)1e9;
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) if (a >= c) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 4. House Robber Linear
    // ─────────────────────────────────────────────
    mk({
        title: "House Robber Linear",
        difficulty: "medium",
        tags: "dp",
        description: `You are a robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have connected security systems — if two adjacent houses are robbed the same night, the police are alerted.

Return the maximum amount of money you can rob without alerting the police.

**Input format (per test case):**
- First line: n (number of houses)
- Second line: n space-separated non-negative integers (money in each house)

**Output format:**
- A single integer — the maximum money you can rob.

**Constraints:**
- 1 <= n <= 100
- 0 <= nums[i] <= 400`,
        signature: {
            functionName: "rob",
            returnType: "int",
            args: [{ name: "nums", type: "vector<int>" }],
        },
        visible: [
            {
                input: "4\n1 2 3 1",
                output: "4",
                explanation: "Rob house 0 (money 1) and house 2 (money 3): total = 4.",
            },
            {
                input: "5\n2 7 9 3 1",
                output: "12",
                explanation: "Rob houses 0, 2, and 4: 2 + 9 + 1 = 12.",
            },
        ],
        hidden: [
            { input: "1\n9", output: "9" },
            { input: "3\n5 1 5", output: "10" },
            { input: "6\n2 1 1 2 1 1", output: "5" },
        ],
        cppRef: `class Solution {
public:
    int rob(vector<int> nums) {
        int take = 0, skip = 0;
        for (int x : nums) {
            int ntake = skip + x;
            skip = max(skip, take);
            take = ntake;
        }
        return max(take, skip);
    }
};`,
        pyRef: `class Solution:
    def rob(self, nums):
        take = skip = 0
        for x in nums:
            take, skip = skip + x, max(skip, take)
        return max(take, skip)`,
        javaRef: `class Solution {
    public int rob(int[] nums) {
        int take = 0, skip = 0;
        for (int x : nums) {
            int ntake = skip + x;
            skip = Math.max(skip, take);
            take = ntake;
        }
        return Math.max(take, skip);
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 5. Edit Distance
    // ─────────────────────────────────────────────
    mk({
        title: "Edit Distance",
        difficulty: "hard",
        tags: "dp",
        description: `Given two strings \`a\` and \`b\`, return the minimum number of single-character operations (insert, delete, or replace) needed to convert \`a\` into \`b\`.

**Input format (per test case):**
- First line: string a (single token)
- Second line: string b (single token)

**Output format:**
- A single integer — the minimum edit distance.

**Constraints:**
- 0 <= len(a), len(b) <= 500
- a and b consist of lowercase English letters.`,
        signature: {
            functionName: "editDistance",
            returnType: "int",
            args: [
                { name: "a", type: "string" },
                { name: "b", type: "string" },
            ],
        },
        visible: [
            {
                input: "horse\nros",
                output: "3",
                explanation:
                    "horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e).",
            },
            {
                input: "intention\nexecution",
                output: "5",
                explanation:
                    "intention -> exention -> exection -> execuion -> executon -> execution.",
            },
        ],
        hidden: [
            { input: "abc\nabc", output: "0" },
            { input: "a\nb", output: "1" },
            { input: "kitten\nsitting", output: "3" },
        ],
        cppRef: `class Solution {
public:
    int editDistance(string a, string b) {
        int n = a.size(), m = b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1));
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
        return dp[n][m];
    }
};`,
        pyRef: `class Solution:
    def editDistance(self, a, b):
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = i
        for j in range(m + 1):
            dp[0][j] = j
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        return dp[n][m]`,
        javaRef: `class Solution {
    public int editDistance(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
            }
        }
        return dp[n][m];
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 6. Minimum Path Sum Grid
    // ─────────────────────────────────────────────
    mk({
        title: "Minimum Path Sum Grid",
        difficulty: "medium",
        tags: "dp",
        description: `Given an \`m x n\` grid filled with non-negative numbers, find a path from the top-left corner to the bottom-right corner that minimizes the sum of all numbers along the path.

You can only move **right** or **down** at each step.

**Input format (per test case):**
- First line: two integers r and c (rows and columns)
- Next r lines: c space-separated non-negative integers per line

**Output format:**
- A single integer — the minimum path sum.

**Constraints:**
- 1 <= r, c <= 200
- 0 <= grid[i][j] <= 200`,
        signature: {
            functionName: "minPathSum",
            returnType: "int",
            args: [{ name: "grid", type: "vector<vector<int>>" }],
        },
        visible: [
            {
                input: "3 3\n1 3 1\n1 5 1\n4 2 1",
                output: "7",
                explanation: "Path 1 -> 3 -> 1 -> 1 -> 1 = 7.",
            },
            {
                input: "2 3\n1 2 3\n4 5 6",
                output: "12",
                explanation: "Path 1 -> 2 -> 3 -> 6 = 12.",
            },
        ],
        hidden: [
            { input: "1 1\n0", output: "0" },
            { input: "1 4\n1 2 3 4", output: "10" },
            { input: "3 2\n1 2\n3 4\n5 6", output: "14" },
        ],
        cppRef: `class Solution {
public:
    int minPathSum(vector<vector<int>> grid) {
        int n = grid.size(), m = grid[0].size();
        vector<vector<int>> dp(n, vector<int>(m, 1e9));
        dp[0][0] = grid[0][0];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (i) dp[i][j] = min(dp[i][j], dp[i - 1][j] + grid[i][j]);
                if (j) dp[i][j] = min(dp[i][j], dp[i][j - 1] + grid[i][j]);
            }
        }
        return dp[n - 1][m - 1];
    }
};`,
        pyRef: `class Solution:
    def minPathSum(self, grid):
        n, m = len(grid), len(grid[0])
        dp = [[10**18] * m for _ in range(n)]
        dp[0][0] = grid[0][0]
        for i in range(n):
            for j in range(m):
                if i:
                    dp[i][j] = min(dp[i][j], dp[i - 1][j] + grid[i][j])
                if j:
                    dp[i][j] = min(dp[i][j], dp[i][j - 1] + grid[i][j])
        return dp[-1][-1]`,
        javaRef: `class Solution {
    public int minPathSum(int[][] grid) {
        int n = grid.length, m = grid[0].length;
        int[][] dp = new int[n][m];
        for (int[] row : dp) java.util.Arrays.fill(row, (int) 1e9);
        dp[0][0] = grid[0][0];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (i > 0) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j] + grid[i][j]);
                if (j > 0) dp[i][j] = Math.min(dp[i][j], dp[i][j - 1] + grid[i][j]);
            }
        }
        return dp[n - 1][m - 1];
    }
}`,
    }),
];

runSeedCli(problems);