import { mk, runSeedCli } from "../utils/seedHelper.js";

const problems = [
    // ─────────────────────────────────────────────
    // 1. Two Sum Sorted
    // ─────────────────────────────────────────────
    mk({
        title: "Two Sum Sorted",
        difficulty: "easy",
        tags: "array",
        description: `Given a sorted integer array \`nums\` and an integer \`target\`, return the 0-indexed pair \`[i, j]\` such that \`nums[i] + nums[j] == target\` and \`i < j\`.

Exactly one valid answer is guaranteed to exist.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers (sorted)
- Third line: target

**Output format:**
- Two space-separated integers i and j.

**Constraints:**
- 2 <= n <= 2 * 10^5
- -10^9 <= nums[i], target <= 10^9`,
        // Args order: nums (vector<int>), target (int)
        // So input must be: n, n values, then target
        signature: {
            functionName: "twoSumSorted",
            returnType: "vector<int>",
            args: [
                { name: "nums", type: "vector<int>" },
                { name: "target", type: "int" },
            ],
        },
        visible: [
            {
                input: "4\n2 7 11 15\n9",
                output: "0 1",
                explanation: "nums[0] + nums[1] = 2 + 7 = 9 = target.",
            },
            {
                input: "5\n1 2 3 4 6\n8",
                output: "1 4",
                explanation: "nums[1] + nums[4] = 2 + 6 = 8 = target.",
            },
        ],
        hidden: [
            { input: "6\n-3 -1 0 2 4 9\n1", output: "1 3" },
            { input: "2\n1 3\n4", output: "0 1" },
            { input: "4\n-5 -3 0 8\n5", output: "1 3" },
        ],
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
        javaRef: `class Solution {
    public int[] twoSumSorted(int[] nums, int target) {
        int i = 0, j = nums.length - 1;
        while (i < j) {
            long s = (long) nums[i] + nums[j];
            if (s == target) return new int[]{i, j};
            if (s < target) i++;
            else j--;
        }
        return new int[]{-1, -1};
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 2. Valid Palindrome Alnum
    // ─────────────────────────────────────────────
    mk({
        title: "Valid Palindrome Alnum",
        difficulty: "easy",
        tags: "string",
        description: `Given a string \`s\`, return \`true\` if it is a palindrome after converting uppercase letters to lowercase and removing all non-alphanumeric characters. Otherwise return \`false\`.

An empty string is considered a palindrome.

**Input format (per test case):**
- A single token string s (no spaces within the token).

**Output format:**
- "true" or "false".

**Constraints:**
- 1 <= len(s) <= 2 * 10^5
- s consists of printable ASCII characters (no spaces in test input).`,
        signature: {
            functionName: "isPalindromeAlnum",
            returnType: "bool",
            args: [{ name: "s", type: "string" }],
        },
        visible: [
            {
                input: "AmanaplanacanalPanama",
                output: "true",
                explanation:
                    'After lowering and keeping alnum: "amanaplanacanalpanama" which reads the same forwards and backwards.',
            },
            {
                input: "raceacar",
                output: "false",
                explanation: '"raceacar" is not a palindrome.',
            },
        ],
        hidden: [
            { input: "a", output: "true" },
            { input: "abBA", output: "true" },
            { input: "ab", output: "false" },
        ],
        cppRef: `class Solution {
public:
    bool isPalindromeAlnum(string s) {
        string t;
        for (char c : s) {
            if (isalnum((unsigned char)c)) t.push_back((char)tolower((unsigned char)c));
        }
        int i = 0, j = (int)t.size() - 1;
        while (i < j) {
            if (t[i] != t[j]) return false;
            i++; j--;
        }
        return true;
    }
};`,
        pyRef: `class Solution:
    def isPalindromeAlnum(self, s):
        t = "".join(ch.lower() for ch in s if ch.isalnum())
        return t == t[::-1]`,
        javaRef: `class Solution {
    public boolean isPalindromeAlnum(String s) {
        StringBuilder t = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) t.append(Character.toLowerCase(c));
        }
        String ts = t.toString();
        return ts.equals(new StringBuilder(ts).reverse().toString());
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 3. Longest Unique Substring Length
    // ─────────────────────────────────────────────
    mk({
        title: "Longest Unique Substring Length",
        difficulty: "medium",
        tags: "string",
        description: `Given a string \`s\`, find the length of the longest substring that contains no repeated characters.

**Input format (per test case):**
- A single token string s.

**Output format:**
- A single integer — the length of the longest substring without repeating characters.

**Constraints:**
- 0 <= len(s) <= 2 * 10^5
- s consists of English letters, digits, symbols, and/or spaces (test input uses single tokens only).`,
        signature: {
            functionName: "longestUniqueLen",
            returnType: "int",
            args: [{ name: "s", type: "string" }],
        },
        visible: [
            {
                input: "abcabcbb",
                output: "3",
                explanation: '"abc" is the longest substring without repeating characters, length 3.',
            },
            {
                input: "bbbbb",
                output: "1",
                explanation: "Every character is the same, so the longest unique substring has length 1.",
            },
        ],
        hidden: [
            { input: "pwwkew", output: "3" },
            { input: "a", output: "1" },
            { input: "abcdef", output: "6" },
        ],
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
        javaRef: `class Solution {
    public int longestUniqueLen(String s) {
        int[] last = new int[256];
        java.util.Arrays.fill(last, -1);
        int ans = 0, l = 0;
        for (int r = 0; r < s.length(); r++) {
            l = Math.max(l, last[s.charAt(r)] + 1);
            last[s.charAt(r)] = r;
            ans = Math.max(ans, r - l + 1);
        }
        return ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 4. Product of Array Except Self
    // ─────────────────────────────────────────────
    mk({
        title: "Product of Array Except Self",
        difficulty: "medium",
        tags: "array",
        description: `Given an integer array \`nums\`, return an array \`output\` where \`output[i]\` is the product of all elements of \`nums\` except \`nums[i]\`.

You must solve it **without using division**.

**Input format (per test case):**
- First line: n (size of array)
- Second line: n space-separated integers

**Output format:**
- n space-separated integers representing the result array.

**Constraints:**
- 2 <= n <= 10^5
- -30 <= nums[i] <= 30
- The product of any prefix or suffix fits in a 32-bit integer.`,
        signature: {
            functionName: "productExceptSelf",
            returnType: "vector<int>",
            args: [{ name: "nums", type: "vector<int>" }],
        },
        visible: [
            {
                input: "4\n1 2 3 4",
                output: "24 12 8 6",
                explanation: "output[0]=2*3*4=24, output[1]=1*3*4=12, output[2]=1*2*4=8, output[3]=1*2*3=6.",
            },
            {
                input: "4\n-1 1 0 -3",
                output: "0 0 3 0",
                explanation: "Any product including the zero element becomes 0; output[2]=(-1)*1*(-3)=3.",
            },
        ],
        hidden: [
            { input: "3\n0 0 5", output: "0 0 0" },
            { input: "2\n3 7", output: "7 3" },
            { input: "5\n1 1 1 1 1", output: "1 1 1 1 1" },
        ],
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
        javaRef: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        int p = 1;
        for (int i = 0; i < n; i++) { ans[i] = p; p *= nums[i]; }
        int s = 1;
        for (int i = n - 1; i >= 0; i--) { ans[i] *= s; s *= nums[i]; }
        return ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 5. Minimum Window Length At Least Target Sum
    // ─────────────────────────────────────────────
    mk({
        title: "Minimum Window Length At Least Target Sum",
        difficulty: "medium",
        tags: "array",
        description: `Given an array of positive integers \`nums\` and a positive integer \`target\`, return the **minimum length** of a contiguous subarray whose sum is greater than or equal to \`target\`. If no such subarray exists, return \`0\`.

**Input format (per test case):**
- First line: target (integer)
- Second line: n (size of array)
- Third line: n space-separated positive integers

**Output format:**
- A single integer — the minimum length, or 0 if impossible.

**Constraints:**
- 1 <= target <= 10^9
- 1 <= n <= 10^5
- 1 <= nums[i] <= 10^4`,
        // IMPORTANT: args order is target first, then nums — matching the input format
        signature: {
            functionName: "minSubArrayLen",
            returnType: "int",
            args: [
                { name: "target", type: "int" },
                { name: "nums", type: "vector<int>" },
            ],
        },
        visible: [
            {
                input: "7\n6\n2 3 1 2 4 3",
                output: "2",
                explanation: "The subarray [4,3] has sum 7 >= 7 and length 2, which is minimal.",
            },
            {
                input: "4\n4\n1 4 4 1",
                output: "1",
                explanation: "The single element [4] has sum 4 >= 4.",
            },
        ],
        hidden: [
            { input: "11\n5\n1 1 1 1 1", output: "0" },
            { input: "15\n5\n5 1 3 5 10", output: "2" },
            { input: "3\n3\n1 1 1", output: "3" },
        ],
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
        javaRef: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length, ans = n + 1, l = 0, sum = 0;
        for (int r = 0; r < n; r++) {
            sum += nums[r];
            while (sum >= target) {
                ans = Math.min(ans, r - l + 1);
                sum -= nums[l++];
            }
        }
        return ans == n + 1 ? 0 : ans;
    }
}`,
    }),

    // ─────────────────────────────────────────────
    // 6. Find First Substring Index
    // ─────────────────────────────────────────────
    mk({
        title: "Find First Substring Index",
        difficulty: "medium",
        tags: "string",
        description: `Given two strings \`s\` and \`p\`, return the index of the first occurrence of \`p\` in \`s\`, or \`-1\` if \`p\` is not a substring of \`s\`.

**Input format (per test case):**
- First line: string s
- Second line: string p

Both s and p are single tokens (no internal spaces).

**Output format:**
- A single integer — the 0-based index, or -1.

**Constraints:**
- 1 <= len(s), len(p) <= 10^4
- s and p consist of lowercase English letters.`,
        signature: {
            functionName: "strStrIndex",
            returnType: "int",
            args: [
                { name: "s", type: "string" },
                { name: "p", type: "string" },
            ],
        },
        visible: [
            {
                input: "hello\nll",
                output: "2",
                explanation: '"ll" first appears at index 2 in "hello".',
            },
            {
                input: "aaaaa\nbba",
                output: "-1",
                explanation: '"bba" does not appear in "aaaaa".',
            },
        ],
        hidden: [
            { input: "abc\nabc", output: "0" },
            { input: "abcdef\nef", output: "4" },
            { input: "aaa\naaaa", output: "-1" },
        ],
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
        idx = s.find(p)
        return idx`,
        javaRef: `class Solution {
    public int strStrIndex(String s, String p) {
        if (p.isEmpty()) return 0;
        return s.indexOf(p);
    }
}`,
    }),
];

runSeedCli(problems);