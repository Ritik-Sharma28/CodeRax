import { mk, runSeedCli } from "../utils/seedHelper.js";

const problems = [
    // ─────────────────────────────────────────────
    // 1. Binary Search First Position
    // ─────────────────────────────────────────────
    mk({
        title: "Binary Search First Position",
        difficulty: "easy",
        tags: "binarySearch",
        description: `Given a sorted integer array \`nums\` (non-decreasing order) and an integer \`target\`, return the index of the **first** occurrence of \`target\`. If \`target\` is not found, return \`-1\`.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers (sorted non-decreasing)
- Third line: target

**Output format:**
- A single integer — the 0-based index, or -1.

**Constraints:**
- 1 <= n <= 10^5
- -10^9 <= nums[i], target <= 10^9`,
        signature: {
            functionName: "firstOccurrence",
            returnType: "int",
            args: [
                { name: "nums", type: "vector<int>" },
                { name: "target", type: "int" },
            ],
        },
        visible: [
            {
                input: "6\n1 2 2 2 4 9\n2",
                output: "1",
                explanation: "The value 2 first appears at index 1.",
            },
            {
                input: "4\n1 3 5 7\n2",
                output: "-1",
                explanation: "2 is not present in the array.",
            },
        ],
        hidden: [
            { input: "5\n2 2 2 2 2\n2", output: "0" },
            { input: "1\n7\n7", output: "0" },
            { input: "3\n1 2 3\n4", output: "-1" },
        ],
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
        javaRef: `class Solution {
    public int firstOccurrence(int[] nums, int target) {
        int l = 0, r = nums.length - 1, ans = -1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (nums[m] >= target) r = m - 1;
            else l = m + 1;
            if (nums[m] == target) ans = m;
        }
        return ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 2. Kth Smallest in Sorted Matrix
    // ─────────────────────────────────────────────
    mk({
        title: "Kth Smallest in Sorted Matrix",
        difficulty: "hard",
        tags: "binarySearch",
        description: `Given an \`n x m\` matrix where each row and each column is sorted in non-decreasing order, return the \`k\`-th smallest element (1-indexed) in the matrix.

**Input format (per test case):**
- First line: two integers r and c (rows and columns)
- Next r lines: c space-separated integers per line
- Last line: integer k

**Output format:**
- A single integer — the k-th smallest value.

**Constraints:**
- 1 <= r, c <= 300
- -10^9 <= matrix[i][j] <= 10^9
- 1 <= k <= r * c`,
        signature: {
            functionName: "kthSmallest",
            returnType: "int",
            args: [
                { name: "matrix", type: "vector<vector<int>>" },
                { name: "k", type: "int" },
            ],
        },
        visible: [
            {
                input: "3 3\n1 5 9\n10 11 13\n12 13 15\n8",
                output: "13",
                explanation:
                    "Sorted elements: 1,5,9,10,11,12,13,13,15. The 8th smallest is 13.",
            },
            {
                input: "1 1\n-5\n1",
                output: "-5",
                explanation: "Only one element, so it is the 1st smallest.",
            },
        ],
        hidden: [
            { input: "2 2\n1 2\n1 3\n2", output: "1" },
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n5", output: "5" },
        ],
        cppRef: `class Solution {
public:
    int kthSmallest(vector<vector<int>> matrix, int k) {
        int n = matrix.size(), m = matrix[0].size();
        int lo = matrix[0][0], hi = matrix[n - 1][m - 1];
        auto countLE = [&](int x) {
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
        javaRef: `class Solution {
    public int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length, m = matrix[0].length;
        int lo = matrix[0][0], hi = matrix[n - 1][m - 1];
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            int c = 0, j = m - 1;
            for (int i = 0; i < n; i++) {
                while (j >= 0 && matrix[i][j] > mid) j--;
                c += j + 1;
            }
            if (c < k) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 3. Top K Frequent Elements
    // ─────────────────────────────────────────────
    mk({
        title: "Top K Frequent Elements",
        difficulty: "medium",
        tags: "heap",
        description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. The answer may be returned in any order.

It is guaranteed that the answer is unique (there are no ties at the k-th boundary).

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers
- Third line: integer k

**Output format:**
- k space-separated integers (any order).

**Constraints:**
- 1 <= n <= 10^5
- -10^4 <= nums[i] <= 10^4
- 1 <= k <= number of unique elements`,
        signature: {
            functionName: "topKFrequent",
            returnType: "vector<int>",
            args: [
                { name: "nums", type: "vector<int>" },
                { name: "k", type: "int" },
            ],
        },
        judgeConfig: { outputMode: "unorderedTokens", floatTolerance: 0.000001 },
        visible: [
            {
                input: "6\n1 1 1 2 2 3\n2",
                output: "1 2",
                explanation:
                    "1 appears 3 times, 2 appears 2 times. They are the top 2 frequent.",
            },
            {
                input: "5\n4 4 4 6 6\n1",
                output: "4",
                explanation: "4 appears 3 times and is the most frequent.",
            },
        ],
        hidden: [
            { input: "10\n1 1 1 1 2 2 2 3 3 4\n2", output: "1 2" },
            { input: "7\n5 5 5 5 6 6 7\n3", output: "5 6 7" },
            { input: "1\n1\n1", output: "1" },
        ],
        cppRef: `class Solution {
public:
    vector<int> topKFrequent(vector<int> nums, int k) {
        unordered_map<int, int> f;
        for (int x : nums) f[x]++;
        vector<pair<int, int>> a;
        for (auto& it : f) a.push_back({it.second, it.first});
        sort(a.begin(), a.end(), [](auto& x, auto& y) { return x.first > y.first; });
        vector<int> ans;
        for (int i = 0; i < k && i < (int)a.size(); i++) ans.push_back(a[i].second);
        return ans;
    }
};`,
        pyRef: `from collections import Counter
class Solution:
    def topKFrequent(self, nums, k):
        freq = Counter(nums)
        items = sorted(freq.items(), key=lambda x: -x[1])
        return [x for x, _ in items[:k]]`,
        javaRef: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        java.util.Map<Integer, Integer> f = new java.util.HashMap<>();
        for (int x : nums) f.merge(x, 1, Integer::sum);
        java.util.List<java.util.Map.Entry<Integer, Integer>> entries = new java.util.ArrayList<>(f.entrySet());
        entries.sort((a, b) -> b.getValue() - a.getValue());
        int[] ans = new int[k];
        for (int i = 0; i < k; i++) ans[i] = entries.get(i).getKey();
        return ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 4. Valid Parentheses
    // ─────────────────────────────────────────────
    mk({
        title: "Valid Parentheses",
        difficulty: "easy",
        tags: "stack",
        description: `Given a string \`s\` containing only the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, and \`]\`, determine if the input string is valid.

A string is valid if:
- Open brackets are closed by the same type of bracket.
- Open brackets are closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.

**Input format (per test case):**
- A single token string s.

**Output format:**
- "true" or "false".

**Constraints:**
- 1 <= len(s) <= 10^4
- s consists of parentheses characters only.`,
        signature: {
            functionName: "isValidParentheses",
            returnType: "bool",
            args: [{ name: "s", type: "string" }],
        },
        visible: [
            {
                input: "()[]{}",
                output: "true",
                explanation: "All bracket pairs are properly matched and ordered.",
            },
            {
                input: "(]",
                output: "false",
                explanation: "Opening ( does not match closing ].",
            },
        ],
        hidden: [
            { input: "([{}])", output: "true" },
            { input: "(((", output: "false" },
            { input: "({[)]}", output: "false" },
        ],
        cppRef: `class Solution {
public:
    bool isValidParentheses(string s) {
        vector<char> st;
        unordered_map<char, char> mp;
        mp[')'] = '('; mp[']'] = '['; mp['}'] = '{';
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push_back(c);
            else {
                if (st.empty() || st.back() != mp[c]) return false;
                st.pop_back();
            }
        }
        return st.empty();
    }
};`,
        pyRef: `class Solution:
    def isValidParentheses(self, s):
        st = []
        mp = {')': '(', ']': '[', '}': '{'}
        for c in s:
            if c in "([{":
                st.append(c)
            else:
                if not st or st[-1] != mp.get(c):
                    return False
                st.pop()
        return not st`,
        javaRef: `class Solution {
    public boolean isValidParentheses(String s) {
        java.util.Deque<Character> st = new java.util.ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (st.isEmpty() || st.peek() != expected) return false;
                st.pop();
            }
        }
        return st.isEmpty();
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 5. Sliding Window Maximum
    // ─────────────────────────────────────────────
    mk({
        title: "Sliding Window Maximum",
        difficulty: "hard",
        tags: "queue",
        description: `Given an integer array \`nums\` and an integer \`k\`, there is a sliding window of size \`k\` moving from the left to the right of the array. For each window position, return the maximum element in that window.

The result array has \`n - k + 1\` elements.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers
- Third line: integer k

**Output format:**
- Space-separated integers — the maximum of each window.

**Constraints:**
- 1 <= k <= n <= 10^5
- -10^4 <= nums[i] <= 10^4`,
        signature: {
            functionName: "maxSlidingWindow",
            returnType: "vector<int>",
            args: [
                { name: "nums", type: "vector<int>" },
                { name: "k", type: "int" },
            ],
        },
        visible: [
            {
                input: "8\n1 3 -1 -3 5 3 6 7\n3",
                output: "3 3 5 5 6 7",
                explanation:
                    "Windows: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7.",
            },
            {
                input: "1\n1\n1",
                output: "1",
                explanation: "Single element window.",
            },
        ],
        hidden: [
            { input: "6\n9 8 7 6 5 4\n2", output: "9 8 7 6 5" },
            { input: "5\n1 2 3 4 5\n5", output: "5" },
            { input: "4\n4 3 2 1\n1", output: "4 3 2 1" },
        ],
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
        javaRef: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        java.util.Deque<Integer> dq = new java.util.ArrayDeque<>();
        int[] ans = new int[nums.length - k + 1];
        int idx = 0;
        for (int i = 0; i < nums.length; i++) {
            while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.addLast(i);
            if (i >= k - 1) ans[idx++] = nums[dq.peekFirst()];
        }
        return ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 6. Longest Consecutive Sequence
    // ─────────────────────────────────────────────
    mk({
        title: "Longest Consecutive Sequence",
        difficulty: "medium",
        tags: "hashing",
        description: `Given an unsorted integer array \`nums\`, return the length of the longest sequence of consecutive integers (the elements do not need to be adjacent in the array).

Your algorithm should run in O(n) time.

**Input format (per test case):**
- First line: n (size of array, can be 0)
- Second line: n space-separated integers (omitted if n is 0)

**Output format:**
- A single integer — the length of the longest consecutive sequence. Return 0 for empty arrays.

**Constraints:**
- 0 <= n <= 10^5
- -10^9 <= nums[i] <= 10^9`,
        signature: {
            functionName: "longestConsecutive",
            returnType: "int",
            args: [{ name: "nums", type: "vector<int>" }],
        },
        visible: [
            {
                input: "6\n100 4 200 1 3 2",
                output: "4",
                explanation: "The consecutive sequence is 1, 2, 3, 4 with length 4.",
            },
            {
                input: "4\n1 9 3 2",
                output: "3",
                explanation: "The consecutive sequence is 1, 2, 3 with length 3.",
            },
        ],
        hidden: [
            { input: "7\n0 -1 1 2 -2 3 10", output: "6" },
            { input: "1\n5", output: "1" },
            { input: "0", output: "0" },
        ],
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
        javaRef: `class Solution {
    public int longestConsecutive(int[] nums) {
        java.util.Set<Integer> st = new java.util.HashSet<>();
        for (int x : nums) st.add(x);
        int best = 0;
        for (int x : st) {
            if (!st.contains(x - 1)) {
                int y = x;
                while (st.contains(y)) y++;
                best = Math.max(best, y - x);
            }
        }
        return best;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 7. Jump Game (replaces broken Merge Intervals)
    // ─────────────────────────────────────────────
    mk({
        title: "Jump Game",
        difficulty: "medium",
        tags: "greedy",
        description: `Given an integer array \`nums\` where \`nums[i]\` represents the **maximum** jump length from position \`i\`, return \`true\` if you can reach the last index starting from index 0, otherwise return \`false\`.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated non-negative integers

**Output format:**
- "true" or "false".

**Constraints:**
- 1 <= n <= 10^4
- 0 <= nums[i] <= 10^5`,
        signature: {
            functionName: "canJump",
            returnType: "bool",
            args: [{ name: "nums", type: "vector<int>" }],
        },
        visible: [
            {
                input: "5\n2 3 1 1 4",
                output: "true",
                explanation:
                    "Jump 1 step from index 0 to 1, then 3 steps from index 1 to 4.",
            },
            {
                input: "5\n3 2 1 0 4",
                output: "false",
                explanation:
                    "No matter what, you arrive at index 3 where nums[3]=0 and you are stuck.",
            },
        ],
        hidden: [
            { input: "1\n0", output: "true" },
            { input: "3\n0 1 2", output: "false" },
            { input: "6\n1 1 1 1 1 0", output: "true" },
        ],
        cppRef: `class Solution {
public:
    bool canJump(vector<int> nums) {
        int maxReach = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > maxReach) return false;
            maxReach = max(maxReach, i + nums[i]);
        }
        return true;
    }
};`,
        pyRef: `class Solution:
    def canJump(self, nums):
        max_reach = 0
        for i, x in enumerate(nums):
            if i > max_reach:
                return False
            max_reach = max(max_reach, i + x)
        return True`,
        javaRef: `class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
        }
        return true;
    }
}`,
    }),
];

runSeedCli(problems);