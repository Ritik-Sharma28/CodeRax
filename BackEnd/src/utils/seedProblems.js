import "dotenv/config";
import mongoose from "mongoose";
import main from "../config/db.js";
import Problem from "../models/problem.js";
import User from "../models/user.js";

const makeStartCode = (signature, language) => {
  const { functionName, returnType, args } = signature;
  if (language === "cpp") {
    const argList = args.map((a) => `${a.type} ${a.name}`).join(", ");
    return `class Solution {
public:
    ${returnType} ${functionName}(${argList}) {
        // Write your logic here
    }
};`;
  }
  const argList = args.map((a) => a.name).join(", ");
  return `class Solution:
    def ${functionName}(self, ${argList}):
        # Write your logic here
        pass`;
};

const mkProblem = ({
  title,
  difficulty,
  tags,
  description,
  signature,
  visible,
  hidden,
  cppRef,
  pyRef,
  judgeConfig = { outputMode: "token", floatTolerance: 0.000001 },
}) => ({
  title,
  description,
  difficulty,
  tags,
  judgeConfig,
  problemSignature: signature,
  visibleTestCases: visible,
  hiddenTestCases: hidden,
  startCode: [
    { language: "cpp", initialCode: makeStartCode(signature, "cpp") },
    { language: "python", initialCode: makeStartCode(signature, "python") },
  ],
  referenceSolution: [
    { language: "cpp", completeCode: cppRef },
    { language: "python", completeCode: pyRef },
  ],
});

const problems = [
  mkProblem({
    title: "Two Sum Sorted",
    difficulty: "easy",
    tags: "array",
    description: `Given a sorted integer array nums and an integer target, return the 0-indexed pair [i, j] such that nums[i] + nums[j] == target and i < j.

Input format:
- n
- n integers
- target

Output format:
- Two integers i and j separated by space.

Constraints:
- 2 <= n <= 2e5
- -1e9 <= nums[i], target <= 1e9
- Exactly one valid answer exists.

Example:
Input:
4
2 7 11 15
9
Output:
0 1
Explanation: nums[0] + nums[1] = 9.`,
    signature: { functionName: "twoSumSorted", returnType: "vector<int>", args: [{ name: "nums", type: "vector<int>" }, { name: "target", type: "int" }] },
    visible: [
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "First and second elements sum to target." },
      { input: "5\n1 2 3 4 6\n8", output: "1 4", explanation: "2 + 6 = 8." },
    ],
    hidden: [{ input: "6\n-3 -1 0 2 4 9\n1", output: "1 3" }],
    cppRef: `class Solution {
public:
    vector<int> twoSumSorted(vector<int> nums, int target) {
        int i = 0, j = (int)nums.size() - 1;
        while (i < j) {
            long long s = (long long)nums[i] + nums[j];
            if (s == target) return {i, j};
            if (s < target) i++;
            else j--;
        }
        return {-1, -1};
    }
};`,
    pyRef: `class Solution:
    def twoSumSorted(self, nums, target):
        i, j = 0, len(nums) - 1
        while i < j:
            s = nums[i] + nums[j]
            if s == target:
                return [i, j]
            if s < target:
                i += 1
            else:
                j -= 1
        return [-1, -1]`,
  }),
  mkProblem({
    title: "Valid Palindrome Alnum",
    difficulty: "easy",
    tags: "string",
    description: `Return true if string s is a palindrome after converting uppercase letters to lowercase and removing all non-alphanumeric characters. Otherwise return false.

Input format:
- s (single token string; test data avoids spaces)

Output:
- "true" or "false".

Edge cases:
- Empty string should be considered palindrome.
- String with only symbols is also palindrome.
`,
    signature: { functionName: "isPalindromeAlnum", returnType: "bool", args: [{ name: "s", type: "string" }] },
    visible: [
      { input: "AmanaplanacanalPanama", output: "true", explanation: "Normalized string reads same both ways." },
      { input: "raceacar", output: "false", explanation: "Not palindrome." },
    ],
    hidden: [{ input: "a", output: "true" }],
    cppRef: `class Solution {
public:
    bool isPalindromeAlnum(string s) {
        string t;
        for (char c : s) if (isalnum((unsigned char)c)) t.push_back((char)tolower((unsigned char)c));
        int i = 0, j = (int)t.size() - 1;
        while (i < j) if (t[i++] != t[j--]) return false;
        return true;
    }
};`,
    pyRef: `class Solution:
    def isPalindromeAlnum(self, s):
        t = "".join(ch.lower() for ch in s if ch.isalnum())
        return t == t[::-1]`,
  }),
  mkProblem({
    title: "Longest Unique Substring Length",
    difficulty: "medium",
    tags: "string",
    description: `Find the length of the longest substring of s that contains no repeated characters.

Input: s
Output: integer length

Constraints:
- 0 <= len(s) <= 2e5
`,
    signature: { functionName: "longestUniqueLen", returnType: "int", args: [{ name: "s", type: "string" }] },
    visible: [
      { input: "abcabcbb", output: "3", explanation: "abc is longest unique substring." },
      { input: "bbbbb", output: "1", explanation: "Single char window only." },
    ],
    hidden: [{ input: "pwwkew", output: "3" }],
    cppRef: `class Solution {
public:
    int longestUniqueLen(string s) {
        vector<int> last(256, -1);
        int ans = 0, l = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            l = max(l, last[(unsigned char)s[r]] + 1);
            last[(unsigned char)s[r]] = r;
            ans = max(ans, r - l + 1);
        }
        return ans;
    }
};`,
    pyRef: `class Solution:
    def longestUniqueLen(self, s):
        last = {}
        l = 0
        ans = 0
        for r, ch in enumerate(s):
            if ch in last and last[ch] >= l:
                l = last[ch] + 1
            last[ch] = r
            ans = max(ans, r - l + 1)
        return ans`,
  }),
  mkProblem({
    title: "Reverse Linked List Values",
    difficulty: "easy",
    tags: "linkedList",
    description: `You are given linked-list values as an array representation. Return values after reversing the linked list.

Input:
- n
- n integers

Output:
- n integers in reversed order

Note: This problem uses array representation of linked lists for platform compatibility.`,
    signature: { functionName: "reverseListValues", returnType: "vector<int>", args: [{ name: "vals", type: "vector<int>" }] },
    visible: [
      { input: "5\n1 2 3 4 5", output: "5 4 3 2 1", explanation: "Reverse order." },
      { input: "1\n9", output: "9", explanation: "Single node." },
    ],
    hidden: [{ input: "0\n", output: "" }],
    cppRef: `class Solution {
public:
    vector<int> reverseListValues(vector<int> vals) {
        reverse(vals.begin(), vals.end());
        return vals;
    }
};`,
    pyRef: `class Solution:
    def reverseListValues(self, vals):
        return vals[::-1]`,
  }),
  mkProblem({
    title: "Binary Search First Position",
    difficulty: "easy",
    tags: "binarySearch",
    description: `Given a sorted array nums and target, return the first index where target appears. Return -1 if not found.`,
    signature: { functionName: "firstOccurrence", returnType: "int", args: [{ name: "nums", type: "vector<int>" }, { name: "target", type: "int" }] },
    visible: [
      { input: "6\n1 2 2 2 4 9\n2", output: "1", explanation: "First 2 appears at index 1." },
      { input: "4\n1 3 5 7\n2", output: "-1", explanation: "Not present." },
    ],
    hidden: [{ input: "5\n2 2 2 2 2\n2", output: "0" }],
    cppRef: `class Solution {
public:
    int firstOccurrence(vector<int> nums, int target) {
        int l = 0, r = (int)nums.size() - 1, ans = -1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] >= target) r = m - 1;
            else l = m + 1;
            if (nums[m] == target) ans = m;
        }
        return ans;
    }
};`,
    pyRef: `class Solution:
    def firstOccurrence(self, nums, target):
        l, r, ans = 0, len(nums) - 1, -1
        while l <= r:
            m = (l + r) // 2
            if nums[m] >= target:
                r = m - 1
            else:
                l = m + 1
            if nums[m] == target:
                ans = m
        return ans`,
  }),
  mkProblem({
    title: "Maximum Subarray Sum",
    difficulty: "medium",
    tags: "dp",
    description: `Return the maximum possible sum of a non-empty contiguous subarray.`,
    signature: { functionName: "maxSubArray", returnType: "int", args: [{ name: "nums", type: "vector<int>" }] },
    visible: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "Subarray [4,-1,2,1]." },
      { input: "1\n1", output: "1", explanation: "Single element." },
    ],
    hidden: [{ input: "5\n-8 -3 -6 -2 -5", output: "-2" }],
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
  }),
  mkProblem({
    title: "Climb Stairs Ways",
    difficulty: "easy",
    tags: "dp",
    description: `You can climb 1 or 2 steps at a time. Return the number of distinct ways to reach step n.`,
    signature: { functionName: "climbStairs", returnType: "int", args: [{ name: "n", type: "int" }] },
    visible: [
      { input: "2", output: "2", explanation: "1+1, 2." },
      { input: "3", output: "3", explanation: "111, 12, 21." },
    ],
    hidden: [{ input: "10", output: "89" }],
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
  }),
  mkProblem({
    title: "Coin Change Minimum Coins",
    difficulty: "medium",
    tags: "dp",
    description: `Given coin denominations and amount, return minimum coins needed to make amount. Return -1 if impossible.`,
    signature: { functionName: "coinChange", returnType: "int", args: [{ name: "coins", type: "vector<int>" }, { name: "amount", type: "int" }] },
    visible: [
      { input: "3\n1 2 5\n11", output: "3", explanation: "5+5+1." },
      { input: "1\n2\n3", output: "-1", explanation: "Cannot form 3 using coin 2." },
    ],
    hidden: [{ input: "4\n1 3 4 5\n7", output: "2" }],
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
  }),
  mkProblem({
    title: "House Robber Linear",
    difficulty: "medium",
    tags: "dp",
    description: `Return maximum sum of non-adjacent values from houses array.`,
    signature: { functionName: "rob", returnType: "int", args: [{ name: "nums", type: "vector<int>" }] },
    visible: [
      { input: "4\n1 2 3 1", output: "4", explanation: "Rob houses 1 and 3." },
      { input: "5\n2 7 9 3 1", output: "12", explanation: "2+9+1 or 7+3+1." },
    ],
    hidden: [{ input: "1\n9", output: "9" }],
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
  }),
  mkProblem({
    title: "Binary Tree Height From Level Array",
    difficulty: "medium",
    tags: "tree",
    description: `Given binary tree as level-order array with -1 as null marker, return tree height (root height = 1).

Input:
- n
- n integers where -1 denotes null
`,
    signature: { functionName: "treeHeightLevel", returnType: "int", args: [{ name: "level", type: "vector<int>" }] },
    visible: [
      { input: "7\n3 9 20 -1 -1 15 7", output: "3", explanation: "Height is 3." },
      { input: "1\n1", output: "1", explanation: "Single node." },
    ],
    hidden: [{ input: "3\n1 -1 2", output: "2" }],
    cppRef: `class Solution {
public:
    int treeHeightLevel(vector<int> level) {
        if (level.empty() || level[0] == -1) return 0;
        int n = level.size();
        int maxIdx = 0;
        for (int i = 0; i < n; i++) if (level[i] != -1) maxIdx = i;
        int h = 0;
        while (maxIdx >= 0) { h++; maxIdx = (maxIdx - 1) / 2; if (maxIdx == 0) break; }
        if (n == 1) return 1;
        int depth = 0, idx = 0;
        while ((1 << depth) - 1 <= maxIdx) depth++;
        return max(1, depth);
    }
};`,
    pyRef: `class Solution:
    def treeHeightLevel(self, level):
        if not level or level[0] == -1:
            return 0
        max_idx = 0
        for i, v in enumerate(level):
            if v != -1:
                max_idx = i
        depth = 0
        while (1 << depth) - 1 <= max_idx:
            depth += 1
        return max(1, depth)`,
  }),
  mkProblem({
    title: "BST Search Presence",
    difficulty: "easy",
    tags: "bst",
    description: `Given sorted array representing inorder traversal of BST and a target, return true if target exists else false.`,
    signature: { functionName: "bstContains", returnType: "bool", args: [{ name: "inorder", type: "vector<int>" }, { name: "target", type: "int" }] },
    visible: [
      { input: "5\n1 3 5 7 9\n7", output: "true", explanation: "7 exists." },
      { input: "5\n1 3 5 7 9\n6", output: "false", explanation: "6 does not exist." },
    ],
    hidden: [{ input: "0\n\n1", output: "false" }],
    cppRef: `class Solution {
public:
    bool bstContains(vector<int> inorder, int target) {
        return binary_search(inorder.begin(), inorder.end(), target);
    }
};`,
    pyRef: `class Solution:
    def bstContains(self, inorder, target):
        l, r = 0, len(inorder) - 1
        while l <= r:
            m = (l + r) // 2
            if inorder[m] == target:
                return True
            if inorder[m] < target:
                l = m + 1
            else:
                r = m - 1
        return False`,
  }),
  mkProblem({
    title: "Number of Islands Grid",
    difficulty: "medium",
    tags: "graph",
    description: `Given binary grid of 0/1, return number of connected components of 1s using 4-direction movement.

Input format:
- rows cols
- grid rows
`,
    signature: { functionName: "numIslands", returnType: "int", args: [{ name: "grid", type: "vector<vector<int>>" }] },
    visible: [
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", output: "3", explanation: "Three island components." },
      { input: "2 2\n0 0\n0 0", output: "0", explanation: "No land." },
    ],
    hidden: [{ input: "1 1\n1", output: "1" }],
    cppRef: `class Solution {
public:
    int numIslands(vector<vector<int>> grid) {
        int n = grid.size(); if (!n) return 0;
        int m = grid[0].size(), ans = 0;
        vector<int> dr = {1,-1,0,0}, dc = {0,0,1,-1};
        function<void(int,int)> dfs = [&](int r, int c){
            grid[r][c] = 0;
            for (int k=0;k<4;k++){
                int nr=r+dr[k], nc=c+dc[k];
                if(nr>=0&&nr<n&&nc>=0&&nc<m&&grid[nr][nc]==1) dfs(nr,nc);
            }
        };
        for (int i=0;i<n;i++) for (int j=0;j<m;j++) if (grid[i][j]==1){ ans++; dfs(i,j); }
        return ans;
    }
};`,
    pyRef: `class Solution:
    def numIslands(self, grid):
        if not grid:
            return 0
        n, m = len(grid), len(grid[0])
        ans = 0
        def dfs(r, c):
            grid[r][c] = 0
            for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < m and grid[nr][nc] == 1:
                    dfs(nr, nc)
        for i in range(n):
            for j in range(m):
                if grid[i][j] == 1:
                    ans += 1
                    dfs(i, j)
        return ans`,
  }),
  mkProblem({
    title: "Shortest Path in Binary Matrix",
    difficulty: "medium",
    tags: "graph",
    description: `Given n x n binary matrix, find shortest path from (0,0) to (n-1,n-1) using 8 directions through cells with value 0. Return -1 if not possible.`,
    signature: { functionName: "shortestPathBinaryMatrix", returnType: "int", args: [{ name: "grid", type: "vector<vector<int>>" }] },
    visible: [
      { input: "2 2\n0 1\n1 0", output: "2", explanation: "Diagonal path length 2." },
      { input: "3 3\n1 0 0\n1 1 0\n1 1 0", output: "-1", explanation: "Start blocked." },
    ],
    hidden: [{ input: "1 1\n0", output: "1" }],
    cppRef: `class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>> grid) {
        int n = grid.size(); if (!n) return -1;
        if (grid[0][0] || grid[n-1][n-1]) return -1;
        queue<pair<int,int>> q; q.push({0,0});
        grid[0][0] = 1;
        vector<pair<int,int>> dirs = {{1,0},{-1,0},{0,1},{0,-1},{1,1},{1,-1},{-1,1},{-1,-1}};
        while(!q.empty()){
            auto [r,c] = q.front(); q.pop();
            int d = grid[r][c];
            if (r == n-1 && c == n-1) return d;
            for (auto [dr,dc] : dirs){
                int nr=r+dr,nc=c+dc;
                if(nr>=0&&nr<n&&nc>=0&&nc<n&&grid[nr][nc]==0){
                    grid[nr][nc]=d+1;
                    q.push({nr,nc});
                }
            }
        }
        return -1;
    }
};`,
    pyRef: `from collections import deque
class Solution:
    def shortestPathBinaryMatrix(self, grid):
        n = len(grid)
        if n == 0 or grid[0][0] != 0 or grid[n-1][n-1] != 0:
            return -1
        q = deque([(0, 0)])
        grid[0][0] = 1
        dirs = [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]
        while q:
            r, c = q.popleft()
            d = grid[r][c]
            if r == n - 1 and c == n - 1:
                return d
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                    grid[nr][nc] = d + 1
                    q.append((nr, nc))
        return -1`,
  }),
  mkProblem({
    title: "Top K Frequent Elements",
    difficulty: "medium",
    tags: "heap",
    description: `Return any order of k most frequent integers from nums.`,
    signature: { functionName: "topKFrequent", returnType: "vector<int>", args: [{ name: "nums", type: "vector<int>" }, { name: "k", type: "int" }] },
    judgeConfig: { outputMode: "unorderedTokens", floatTolerance: 0.000001 },
    visible: [
      { input: "6\n1 1 1 2 2 3\n2", output: "1 2", explanation: "1 and 2 are most frequent." },
      { input: "5\n4 4 4 6 6\n1", output: "4", explanation: "4 is most frequent." },
    ],
    hidden: [{ input: "7\n5 5 6 6 7 7 7\n2", output: "7 5" }],
    cppRef: `class Solution {
public:
    vector<int> topKFrequent(vector<int> nums, int k) {
        unordered_map<int,int> f;
        for(int x: nums) f[x]++;
        vector<pair<int,int>> a;
        for (auto &it: f) a.push_back({it.second, it.first});
        sort(a.begin(), a.end(), [](auto &x, auto &y){ return x.first > y.first; });
        vector<int> ans;
        for (int i=0; i<k && i<(int)a.size(); i++) ans.push_back(a[i].second);
        return ans;
    }
};`,
    pyRef: `from collections import Counter
class Solution:
    def topKFrequent(self, nums, k):
        freq = Counter(nums)
        items = sorted(freq.items(), key=lambda x: -x[1])
        return [x for x, _ in items[:k]]`,
  }),
  mkProblem({
    title: "Valid Parentheses",
    difficulty: "easy",
    tags: "stack",
    description: `Given string s of parentheses (), {}, [] return true if valid. A sequence is valid if open brackets are closed by same type in correct order.`,
    signature: { functionName: "isValidParentheses", returnType: "bool", args: [{ name: "s", type: "string" }] },
    visible: [
      { input: "()[]{}", output: "true", explanation: "Balanced brackets." },
      { input: "(]", output: "false", explanation: "Mismatched close bracket." },
    ],
    hidden: [{ input: "([{}])", output: "true" }],
    cppRef: `class Solution {
public:
    bool isValidParentheses(string s) {
        vector<char> st;
        unordered_map<char,char> mp={{')','('},{']','['},{'}','{'}};
        for(char c: s){
            if(c=='('||c=='['||c=='{') st.push_back(c);
            else{
                if(st.empty()||st.back()!=mp[c]) return false;
                st.pop_back();
            }
        }
        return st.empty();
    }
};`,
    pyRef: `class Solution:
    def isValidParentheses(self, s):
        st = []
        mp = {')':'(', ']':'[', '}':'{'}
        for c in s:
            if c in "([{":
                st.append(c)
            else:
                if not st or st[-1] != mp.get(c):
                    return False
                st.pop()
        return not st`,
  }),
  mkProblem({
    title: "Sliding Window Maximum",
    difficulty: "hard",
    tags: "queue",
    description: `Given nums and window size k, return max for each sliding window of size k.`,
    signature: { functionName: "maxSlidingWindow", returnType: "vector<int>", args: [{ name: "nums", type: "vector<int>" }, { name: "k", type: "int" }] },
    visible: [
      { input: "8\n1 3 -1 -3 5 3 6 7\n3", output: "3 3 5 5 6 7", explanation: "Standard deque window maxima." },
      { input: "1\n1\n1", output: "1", explanation: "Single window." },
    ],
    hidden: [{ input: "6\n9 8 7 6 5 4\n2", output: "9 8 7 6 5" }],
    cppRef: `class Solution {
public:
    vector<int> maxSlidingWindow(vector<int> nums, int k) {
        deque<int> dq;
        vector<int> ans;
        for (int i = 0; i < (int)nums.size(); i++) {
            while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (i >= k - 1) ans.push_back(nums[dq.front()]);
        }
        return ans;
    }
};`,
    pyRef: `from collections import deque
class Solution:
    def maxSlidingWindow(self, nums, k):
        dq = deque()
        ans = []
        for i, x in enumerate(nums):
            while dq and dq[0] <= i - k:
                dq.popleft()
            while dq and nums[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if i >= k - 1:
                ans.append(nums[dq[0]])
        return ans`,
  }),
  mkProblem({
    title: "Merge Intervals",
    difficulty: "medium",
    tags: "greedy",
    description: `Given intervals as matrix [start, end], merge all overlapping intervals and return merged intervals sorted by start.`,
    signature: { functionName: "mergeIntervals", returnType: "vector<int>", args: [{ name: "flat", type: "vector<int>" }] },
    description: `Given intervals in flattened form where first value is count n followed by n pairs [start end], return flattened merged output.

Input vector format:
[n, s1, e1, s2, e2, ...]
Output vector format follows same: [m, s1, e1, ...]
`,
    visible: [
      { input: "9\n4 1 3 2 6 8 10 15 18", output: "5 3 1 6 8 10 15 18", explanation: "Intervals [1,3] and [2,6] merge." },
      { input: "5\n2 1 4 5 6", output: "5 2 1 4 5 6", explanation: "No merge needed." },
    ],
    hidden: [{ input: "7\n3 1 4 2 3 7 9", output: "5 2 1 4 7 9" }],
    cppRef: `class Solution {
public:
    vector<int> mergeIntervals(vector<int> flat) {
        if (flat.empty()) return {};
        int n = flat[0];
        vector<pair<int,int>> iv;
        for (int i = 1; i + 1 < (int)flat.size() && (int)iv.size() < n; i += 2) iv.push_back({flat[i], flat[i+1]});
        sort(iv.begin(), iv.end());
        vector<pair<int,int>> out;
        for (auto &p: iv) {
            if (out.empty() || p.first > out.back().second) out.push_back(p);
            else out.back().second = max(out.back().second, p.second);
        }
        vector<int> ans; ans.push_back((int)out.size());
        for (auto &p: out) { ans.push_back(p.first); ans.push_back(p.second); }
        return ans;
    }
};`,
    pyRef: `class Solution:
    def mergeIntervals(self, flat):
        if not flat:
            return []
        n = flat[0]
        iv = []
        i = 1
        while i + 1 < len(flat) and len(iv) < n:
            iv.append((flat[i], flat[i + 1]))
            i += 2
        iv.sort()
        out = []
        for s, e in iv:
            if not out or s > out[-1][1]:
                out.append([s, e])
            else:
                out[-1][1] = max(out[-1][1], e)
        ans = [len(out)]
        for s, e in out:
            ans.extend([s, e])
        return ans`,
  }),
  mkProblem({
    title: "Product of Array Except Self",
    difficulty: "medium",
    tags: "array",
    description: `Return array output where output[i] is product of all nums except nums[i], without division.`,
    signature: { functionName: "productExceptSelf", returnType: "vector<int>", args: [{ name: "nums", type: "vector<int>" }] },
    visible: [
      { input: "4\n1 2 3 4", output: "24 12 8 6", explanation: "Prefix-suffix products." },
      { input: "4\n-1 1 0 -3", output: "0 0 3 0", explanation: "Single zero case." },
    ],
    hidden: [{ input: "3\n0 0 5", output: "0 0 0" }],
    cppRef: `class Solution {
public:
    vector<int> productExceptSelf(vector<int> nums) {
        int n = nums.size();
        vector<int> ans(n, 1);
        int p = 1;
        for (int i = 0; i < n; i++) { ans[i] = p; p *= nums[i]; }
        int s = 1;
        for (int i = n - 1; i >= 0; i--) { ans[i] *= s; s *= nums[i]; }
        return ans;
    }
};`,
    pyRef: `class Solution:
    def productExceptSelf(self, nums):
        n = len(nums)
        ans = [1] * n
        p = 1
        for i in range(n):
            ans[i] = p
            p *= nums[i]
        s = 1
        for i in range(n - 1, -1, -1):
            ans[i] *= s
            s *= nums[i]
        return ans`,
  }),
  mkProblem({
    title: "Longest Consecutive Sequence",
    difficulty: "medium",
    tags: "hashing",
    description: `Given unsorted nums, return length of longest consecutive elements sequence in O(n).`,
    signature: { functionName: "longestConsecutive", returnType: "int", args: [{ name: "nums", type: "vector<int>" }] },
    visible: [
      { input: "6\n100 4 200 1 3 2", output: "4", explanation: "1,2,3,4 length 4." },
      { input: "0\n", output: "0", explanation: "Empty input." },
    ],
    hidden: [{ input: "7\n0 -1 1 2 -2 3 10", output: "6" }],
    cppRef: `class Solution {
public:
    int longestConsecutive(vector<int> nums) {
        unordered_set<int> st(nums.begin(), nums.end());
        int best = 0;
        for (int x : st) {
            if (!st.count(x - 1)) {
                int y = x;
                while (st.count(y)) y++;
                best = max(best, y - x);
            }
        }
        return best;
    }
};`,
    pyRef: `class Solution:
    def longestConsecutive(self, nums):
        st = set(nums)
        best = 0
        for x in st:
            if x - 1 not in st:
                y = x
                while y in st:
                    y += 1
                best = max(best, y - x)
        return best`,
  }),
  mkProblem({
    title: "Minimum Window Length At Least Target Sum",
    difficulty: "medium",
    tags: "array",
    description: `Given positive integer array nums and target, return minimum length of contiguous subarray with sum >= target. Return 0 if no such subarray.`,
    signature: { functionName: "minSubArrayLen", returnType: "int", args: [{ name: "target", type: "int" }, { name: "nums", type: "vector<int>" }] },
    visible: [
      { input: "7\n6\n2 3 1 2 4 3", output: "2", explanation: "Subarray [4,3]." },
      { input: "4\n4\n1 4 4 1", output: "1", explanation: "Single element 4." },
    ],
    hidden: [{ input: "11\n5\n1 1 1 1 1", output: "0" }],
    cppRef: `class Solution {
public:
    int minSubArrayLen(int target, vector<int> nums) {
        int n = nums.size(), ans = n + 1, l = 0, sum = 0;
        for (int r = 0; r < n; r++) {
            sum += nums[r];
            while (sum >= target) {
                ans = min(ans, r - l + 1);
                sum -= nums[l++];
            }
        }
        return ans == n + 1 ? 0 : ans;
    }
};`,
    pyRef: `class Solution:
    def minSubArrayLen(self, target, nums):
        l = 0
        s = 0
        ans = len(nums) + 1
        for r, x in enumerate(nums):
            s += x
            while s >= target:
                ans = min(ans, r - l + 1)
                s -= nums[l]
                l += 1
        return 0 if ans == len(nums) + 1 else ans`,
  }),
  mkProblem({
    title: "Kth Smallest in Sorted Matrix",
    difficulty: "hard",
    tags: "binarySearch",
    description: `Given row-wise and column-wise sorted matrix, return kth smallest value.`,
    signature: { functionName: "kthSmallest", returnType: "int", args: [{ name: "matrix", type: "vector<vector<int>>" }, { name: "k", type: "int" }] },
    visible: [
      { input: "3 3\n1 5 9\n10 11 13\n12 13 15\n8", output: "13", explanation: "8th smallest is 13." },
      { input: "1 1\n-5\n1", output: "-5", explanation: "Only element." },
    ],
    hidden: [{ input: "2 2\n1 2\n1 3\n2", output: "1" }],
    cppRef: `class Solution {
public:
    int kthSmallest(vector<vector<int>> matrix, int k) {
        int n = matrix.size(), m = matrix[0].size();
        int lo = matrix[0][0], hi = matrix[n-1][m-1];
        auto countLE = [&](int x){
            int c = 0, j = m - 1;
            for (int i = 0; i < n; i++) {
                while (j >= 0 && matrix[i][j] > x) j--;
                c += (j + 1);
            }
            return c;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (countLE(mid) < k) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
};`,
    pyRef: `class Solution:
    def kthSmallest(self, matrix, k):
        n, m = len(matrix), len(matrix[0])
        lo, hi = matrix[0][0], matrix[-1][-1]
        def count_le(x):
            c = 0
            j = m - 1
            for i in range(n):
                while j >= 0 and matrix[i][j] > x:
                    j -= 1
                c += j + 1
            return c
        while lo < hi:
            mid = (lo + hi) // 2
            if count_le(mid) < k:
                lo = mid + 1
            else:
                hi = mid
        return lo`,
  }),
  mkProblem({
    title: "Edit Distance",
    difficulty: "hard",
    tags: "dp",
    description: `Given two strings word1 and word2, return minimum operations (insert, delete, replace) needed to convert word1 into word2.`,
    signature: { functionName: "editDistance", returnType: "int", args: [{ name: "a", type: "string" }, { name: "b", type: "string" }] },
    visible: [
      { input: "horse\nros", output: "3", explanation: "horse -> rorse -> rose -> ros." },
      { input: "intention\nexecution", output: "5", explanation: "Classic example." },
    ],
    hidden: [{ input: "abc\nabc", output: "0" }],
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
        dp = [[0]*(m+1) for _ in range(n+1)]
        for i in range(n+1):
            dp[i][0] = i
        for j in range(m+1):
            dp[0][j] = j
        for i in range(1, n+1):
            for j in range(1, m+1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
        return dp[n][m]`,
  }),
  mkProblem({
    title: "Minimum Path Sum Grid",
    difficulty: "medium",
    tags: "dp",
    description: `Given a grid of non-negative numbers, find path from top-left to bottom-right with minimum sum moving only right or down.`,
    signature: { functionName: "minPathSum", returnType: "int", args: [{ name: "grid", type: "vector<vector<int>>" }] },
    visible: [
      { input: "3 3\n1 3 1\n1 5 1\n4 2 1", output: "7", explanation: "1->3->1->1->1." },
      { input: "2 3\n1 2 3\n4 5 6", output: "12", explanation: "1+2+3+6." },
    ],
    hidden: [{ input: "1 1\n0", output: "0" }],
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
                    dp[i][j] = min(dp[i][j], dp[i-1][j] + grid[i][j])
                if j:
                    dp[i][j] = min(dp[i][j], dp[i][j-1] + grid[i][j])
        return dp[-1][-1]`,
  }),
  mkProblem({
    title: "Rabin-Karp First Match",
    difficulty: "medium",
    tags: "string",
    description: `Return first index where pattern p appears in string s, else -1.`,
    signature: { functionName: "strStrIndex", returnType: "int", args: [{ name: "s", type: "string" }, { name: "p", type: "string" }] },
    visible: [
      { input: "hello\nll", output: "2", explanation: "Substring starts at index 2." },
      { input: "aaaaa\nbba", output: "-1", explanation: "Not found." },
    ],
    hidden: [{ input: "abc\n", output: "0" }],
    cppRef: `class Solution {
public:
    int strStrIndex(string s, string p) {
        if (p.empty()) return 0;
        if (p.size() > s.size()) return -1;
        for (int i = 0; i + (int)p.size() <= (int)s.size(); i++) {
            if (s.compare(i, p.size(), p) == 0) return i;
        }
        return -1;
    }
};`,
    pyRef: `class Solution:
    def strStrIndex(self, s, p):
        if p == "":
            return 0
        return s.find(p)`,
  }),
  mkProblem({
    title: "Dijkstra Shortest Distance",
    difficulty: "hard",
    tags: "graph",
    description: `Given weighted directed graph as adjacency matrix (0 means no edge except diagonal), return shortest distance from src to dst, or -1 if unreachable.`,
    signature: { functionName: "shortestDistance", returnType: "int", args: [{ name: "mat", type: "vector<vector<int>>" }, { name: "src", type: "int" }, { name: "dst", type: "int" }] },
    visible: [
      { input: "3 3\n0 1 4\n0 0 2\n0 0 0\n0\n2", output: "3", explanation: "0->1->2 path cost 3." },
      { input: "2 2\n0 0\n0 0\n0\n1", output: "-1", explanation: "No path exists." },
    ],
    hidden: [{ input: "4 4\n0 5 0 10\n0 0 3 0\n0 0 0 1\n0 0 0 0\n0\n3", output: "9" }],
    cppRef: `class Solution {
public:
    int shortestDistance(vector<vector<int>> mat, int src, int dst) {
        int n = mat.size();
        const int INF = 1e9;
        vector<int> dist(n, INF);
        dist[src] = 0;
        using P = pair<int,int>;
        priority_queue<P, vector<P>, greater<P>> pq;
        pq.push({0, src});
        while(!pq.empty()){
            auto [d,u] = pq.top(); pq.pop();
            if(d != dist[u]) continue;
            if(u == dst) return d;
            for(int v=0; v<n; v++){
                if(u != v && mat[u][v] > 0 && d + mat[u][v] < dist[v]){
                    dist[v] = d + mat[u][v];
                    pq.push({dist[v], v});
                }
            }
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
};`,
    pyRef: `import heapq
class Solution:
    def shortestDistance(self, mat, src, dst):
        n = len(mat)
        INF = 10**18
        dist = [INF] * n
        dist[src] = 0
        pq = [(0, src)]
        while pq:
            d, u = heapq.heappop(pq)
            if d != dist[u]:
                continue
            if u == dst:
                return d
            for v in range(n):
                w = mat[u][v]
                if u != v and w > 0 and d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(pq, (dist[v], v))
        return -1 if dist[dst] >= INF else dist[dst]`,
  }),
];

const seed = async () => {
  await main();
  const admin = await User.findOne({ role: "admin" }).select("_id");
  const fallbackUser = admin || (await User.findOne({}).select("_id"));
  if (!fallbackUser) {
    throw new Error("No user found. Create at least one user/admin before seeding problems.");
  }

  let upserts = 0;
  for (const p of problems) {
    await Problem.updateOne(
      { title: p.title },
      { $set: { ...p, problemCreator: fallbackUser._id } },
      { upsert: true }
    );
    upserts++;
  }

  console.log(`Seeded/updated ${upserts} problems successfully.`);
  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error("Problem seed failed:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
