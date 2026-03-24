import { mk, runSeedCli } from "../utils/seedHelper.js";

const problems = [
    mk({
        title: "Reverse Linked List Values",
        difficulty: "easy",
        tags: "linkedList",
        description: "You are given an array of integers representing the values of a linked list. Return the array of values after reversing the order of the elements.",
        signature: { functionName: "reverseListValues", returnType: "vector<int>", args: [{ name: "vals", type: "vector<int>" }] },
        visible: [
            { input: "5\n1 2 3 4 5", output: "5 4 3 2 1", explanation: "The linked list values are reversed." },
            { input: "1\n9", output: "9", explanation: "A single node remains the same." },
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
        javaRef: `class Solution {
    public int[] reverseListValues(int[] vals) {
        int n = vals.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            res[i] = vals[n - 1 - i];
        }
        return res;
    }
}`,
    }),
    mk({
        title: "Binary Tree Height From Level Array",
        difficulty: "medium",
        tags: "tree",
        description: "Given an array representation of a binary tree where the left child of a node at index `i` is located at index `2*i + 1` and the right child is at index `2*i + 2`. The value `-1` denotes a null node. \n\nCalculate and return the height of the tree. The height of an empty tree is 0, and a tree with only the root node has a height of 1.",
        signature: { functionName: "treeHeightLevel", returnType: "int", args: [{ name: "level", type: "vector<int>" }] },
        visible: [
            { input: "7\n3 9 20 -1 -1 15 7", output: "3", explanation: "The tree has 3 levels." },
            { input: "1\n1", output: "1", explanation: "Only the root node exists." },
        ],
        hidden: [{ input: "0\n", output: "0" }],
        cppRef: `class Solution {
public:
    int treeHeightLevel(vector<int> level) {
        if (level.empty() || level[0] == -1) return 0;
        int maxIdx = 0;
        for (int i = 0; i < level.size(); i++) {
            if (level[i] != -1) maxIdx = i;
        }
        int depth = 0;
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
        javaRef: `class Solution {
    public int treeHeightLevel(int[] level) {
        if (level.length == 0 || level[0] == -1) return 0;
        int maxIdx = 0;
        for (int i = 0; i < level.length; i++) {
            if (level[i] != -1) maxIdx = i;
        }
        int depth = 0;
        while ((1 << depth) - 1 <= maxIdx) depth++;
        return Math.max(1, depth);
    }
}`,
    }),
    mk({
        title: "BST Search Presence",
        difficulty: "easy",
        tags: "bst",
        description: "You are given a sorted integer array representing the inorder traversal of a Binary Search Tree (BST) and a `target` integer. Return `true` if the target exists in the BST, otherwise return `false`.",
        signature: { functionName: "bstContains", returnType: "bool", args: [{ name: "inorder", type: "vector<int>" }, { name: "target", type: "int" }] },
        visible: [
            { input: "5\n1 3 5 7 9\n7", output: "true", explanation: "7 is present in the array." },
            { input: "5\n1 3 5 7 9\n6", output: "false", explanation: "6 is not present in the array." },
        ],
        hidden: [{ input: "0\n1", output: "false" }],
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
        javaRef: `class Solution {
    public boolean bstContains(int[] inorder, int target) {
        int l = 0, r = inorder.length - 1;
        while (l <= r) {
            int m = l + (r - l) / 2;
            if (inorder[m] == target) return true;
            if (inorder[m] < target) l = m + 1;
            else r = m - 1;
        }
        return false;
    }
}`,
    }),
    mk({
        title: "Number of Islands Grid",
        difficulty: "medium",
        tags: "graph",
        description: "Given an `m x n` 2D binary grid representing a map of `1`s (land) and `0`s (water), return the number of islands. \n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        signature: { functionName: "numIslands", returnType: "int", args: [{ name: "grid", type: "vector<vector<int>>" }] },
        visible: [
            { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", output: "3", explanation: "There are three distinct connected components of 1s." },
            { input: "2 2\n0 0\n0 0", output: "0", explanation: "There is no land in the grid." },
        ],
        hidden: [{ input: "1 1\n1", output: "1" }],
        cppRef: `class Solution {
public:
    int numIslands(vector<vector<int>> grid) {
        int n = grid.size(); 
        if (!n) return 0;
        int m = grid[0].size(), ans = 0;
        vector<int> dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        
        function<void(int, int)> dfs = [&](int r, int c) {
            grid[r][c] = 0;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nr < n && nc >= 0 && nc < m && grid[nr][nc] == 1) {
                    dfs(nr, nc);
                }
            }
        };
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (grid[i][j] == 1) { 
                    ans++; 
                    dfs(i, j); 
                }
            }
        }
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
        javaRef: `class Solution {
    public int numIslands(int[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int n = grid.length, m = grid[0].length, ans = 0;
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (grid[i][j] == 1) { 
                    ans++; 
                    dfs(grid, i, j, n, m); 
                }
            }
        }
        return ans;
    }
    
    private void dfs(int[][] g, int r, int c, int n, int m) {
        g[r][c] = 0;
        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < n && nc >= 0 && nc < m && g[nr][nc] == 1) {
                dfs(g, nr, nc, n, m);
            }
        }
    }
}`,
    }),
    mk({
        title: "Shortest Path in Binary Matrix",
        difficulty: "medium",
        tags: "graph",
        description: "Given an `n x m` binary matrix, return the length of the shortest clear path from the top-left cell `(0, 0)` to the bottom-right cell `(n - 1, m - 1)`. \n\nA clear path consists of cells with value `0` connected 8-directionally. If no such path exists, return `-1`. The length of the path is the number of visited cells.",
        signature: { functionName: "shortestPathBinaryMatrix", returnType: "int", args: [{ name: "grid", type: "vector<vector<int>>" }] },
        visible: [
            { input: "2 2\n0 1\n1 0", output: "2", explanation: "Shortest path is (0,0) -> (1,1) diagonally." },
            { input: "3 3\n1 0 0\n1 1 0\n1 1 0", output: "-1", explanation: "The starting cell is blocked (1)." },
        ],
        hidden: [{ input: "1 1\n0", output: "1" }],
        cppRef: `#include <queue>
using namespace std;

class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>> grid) {
        int n = grid.size(); 
        if (!n) return -1;
        int m = grid[0].size();
        if (grid[0][0] == 1 || grid[n-1][m-1] == 1) return -1;
        
        queue<pair<int, int>> q; 
        q.push({0, 0});
        grid[0][0] = 1; // Mark as visited with distance 1
        
        vector<pair<int, int>> dirs = {{1,0}, {-1,0}, {0,1}, {0,-1}, {1,1}, {1,-1}, {-1,1}, {-1,-1}};
        
        while (!q.empty()) {
            auto [r, c] = q.front(); 
            q.pop();
            int d = grid[r][c];
            
            if (r == n - 1 && c == m - 1) return d;
            
            for (auto [dr, dc] : dirs) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < m && grid[nr][nc] == 0) {
                    grid[nr][nc] = d + 1;
                    q.push({nr, nc});
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
        if n == 0: return -1
        m = len(grid[0])
        
        if grid[0][0] != 0 or grid[n-1][m-1] != 0:
            return -1
            
        q = deque([(0, 0)])
        grid[0][0] = 1
        dirs = [(1,0), (-1,0), (0,1), (0,-1), (1,1), (1,-1), (-1,1), (-1,-1)]
        
        while q:
            r, c = q.popleft()
            d = grid[r][c]
            
            if r == n - 1 and c == m - 1:
                return d
                
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < m and grid[nr][nc] == 0:
                    grid[nr][nc] = d + 1
                    q.append((nr, nc))
                    
        return -1`,
        javaRef: `import java.util.*;

class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (n == 0) return -1;
        int m = grid[0].length;
        if (grid[0][0] != 0 || grid[n-1][m-1] != 0) return -1;
        
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{0, 0});
        grid[0][0] = 1;
        
        int[][] dirs = {{1,0}, {-1,0}, {0,1}, {0,-1}, {1,1}, {1,-1}, {-1,1}, {-1,-1}};
        
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int r = cur[0], c = cur[1], d = grid[r][c];
            
            if (r == n - 1 && c == m - 1) return d;
            
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < m && grid[nr][nc] == 0) {
                    grid[nr][nc] = d + 1;
                    q.add(new int[]{nr, nc});
                }
            }
        }
        return -1;
    }
}`,
    }),
    mk({
        title: "Dijkstra Shortest Distance",
        difficulty: "hard",
        tags: "graph",
        description: "Given a weighted directed graph represented by an adjacency matrix where `mat[i][j]` is the weight of the directed edge from `i` to `j` (and `0` implies no edge), return the shortest distance from the source node `src` to the destination node `dst`. \n\nReturn `-1` if the destination is unreachable from the source.",
        signature: { functionName: "shortestDistance", returnType: "int", args: [{ name: "mat", type: "vector<vector<int>>" }, { name: "src", type: "int" }, { name: "dst", type: "int" }] },
        visible: [
            { input: "3 3\n0 1 4\n0 0 2\n0 0 0\n0\n2", output: "3", explanation: "The shortest path is 0 -> 1 -> 2 with total cost 1 + 2 = 3." },
            { input: "2 2\n0 0\n0 0\n0\n1", output: "-1", explanation: "Node 1 is completely disconnected from Node 0." },
        ],
        hidden: [{ input: "4 4\n0 5 0 10\n0 0 3 0\n0 0 0 1\n0 0 0 0\n0\n3", output: "9" }],
        cppRef: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    int shortestDistance(vector<vector<int>> mat, int src, int dst) {
        int n = mat.size();
        const int INF = 1e9;
        vector<int> dist(n, INF);
        dist[src] = 0;
        
        using P = pair<int, int>;
        priority_queue<P, vector<P>, greater<P>> pq;
        pq.push({0, src});
        
        while (!pq.empty()) {
            auto [d, u] = pq.top(); 
            pq.pop();
            
            if (d > dist[u]) continue;
            if (u == dst) return d;
            
            for (int v = 0; v < n; v++) {
                if (u != v && mat[u][v] > 0 && d + mat[u][v] < dist[v]) {
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
        INF = float('inf')
        dist = [INF] * n
        dist[src] = 0
        
        pq = [(0, src)]
        
        while pq:
            d, u = heapq.heappop(pq)
            
            if d > dist[u]:
                continue
            if u == dst:
                return d
                
            for v in range(n):
                w = mat[u][v]
                if u != v and w > 0 and d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(pq, (dist[v], v))
                    
        return -1 if dist[dst] == INF else dist[dst]`,
        javaRef: `import java.util.*;

class Solution {
    public int shortestDistance(int[][] mat, int src, int dst) {
        int n = mat.length;
        int INF = (int)1e9;
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        pq.add(new int[]{0, src});
        
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            
            if (d > dist[u]) continue;
            if (u == dst) return d;
            
            for (int v = 0; v < n; v++) {
                if (u != v && mat[u][v] > 0 && d + mat[u][v] < dist[v]) {
                    dist[v] = d + mat[u][v];
                    pq.add(new int[]{dist[v], v});
                }
            }
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
}`,
    }),
];

runSeedCli(problems);
//g