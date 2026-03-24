import { mk, runSeedCli } from "../utils/seedHelper.js";

const problems = [
    mk({
        title: "Middle Node of Linked List",
        difficulty: "easy",
        tags: "linkedList",
        description: `Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second one.

Input format:
- n
- n space-separated integers

Output format:
- values of the linked list starting from the returned node, space-separated`,
        signature: {
            functionName: "middleNode",
            returnType: "ListNode*",
            args: [{ name: "head", type: "ListNode*" }],
        },
        visible: [
            {
                input: "5\n1 2 3 4 5",
                output: "3 4 5",
                explanation: "Middle is the node with value 3.",
            },
            {
                input: "6\n1 2 3 4 5 6",
                output: "4 5 6",
                explanation: "For even length, return the second middle node.",
            },
        ],
        hidden: [
            { input: "1\n9", output: "9" },
            { input: "2\n8 10", output: "10" },
        ],
        cppRef: `class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};`,
        pyRef: `class Solution:
    def middleNode(self, head):
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow`,
        javaRef: `class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}`,
    }),

    mk({
        title: "Merge Two Sorted Linked Lists",
        difficulty: "easy",
        tags: "linkedList",
        description: `Given the heads of two sorted singly linked lists, merge them into one sorted linked list and return its head.

Input format:
- n1
- n1 space-separated integers
- n2
- n2 space-separated integers

Output format:
- merged linked list values, space-separated`,
        signature: {
            functionName: "mergeTwoLists",
            returnType: "ListNode*",
            args: [
                { name: "list1", type: "ListNode*" },
                { name: "list2", type: "ListNode*" },
            ],
        },
        visible: [
            {
                input: "3\n1 2 4\n3\n1 3 4",
                output: "1 1 2 3 4 4",
                explanation: "Both lists are merged in sorted order.",
            },
            {
                input: "0\n0",
                output: "",
                explanation: "Both lists are empty.",
            },
        ],
        hidden: [
            { input: "0\n3\n2 5 7", output: "2 5 7" },
            { input: "2\n1 2\n0", output: "1 2" },
        ],
        cppRef: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* cur = &dummy;

        while (list1 != nullptr && list2 != nullptr) {
            if (list1->val <= list2->val) {
                cur->next = list1;
                list1 = list1->next;
            } else {
                cur->next = list2;
                list2 = list2->next;
            }
            cur = cur->next;
        }

        cur->next = (list1 != nullptr) ? list1 : list2;
        return dummy.next;
    }
};`,
        pyRef: `class Solution:
    def mergeTwoLists(self, list1, list2):
        dummy = ListNode(0)
        cur = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                cur.next = list1
                list1 = list1.next
            else:
                cur.next = list2
                list2 = list2.next
            cur = cur.next

        cur.next = list1 if list1 else list2
        return dummy.next`,
        javaRef: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;

        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                cur.next = list1;
                list1 = list1.next;
            } else {
                cur.next = list2;
                list2 = list2.next;
            }
            cur = cur.next;
        }

        cur.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}`,
    }),

    mk({
        title: "Maximum Depth of Binary Tree",
        difficulty: "easy",
        tags: "tree",
        description: `Given the root of a binary tree, return its maximum depth.

Input format:
- n
- n level-order values using -1 for null

Output format:
- a single integer`,
        signature: {
            functionName: "maxDepth",
            returnType: "int",
            args: [{ name: "root", type: "TreeNode*" }],
        },
        visible: [
            {
                input: "7\n3 9 20 -1 -1 15 7",
                output: "3",
                explanation: "The longest path from root to leaf has 3 nodes.",
            },
            {
                input: "1\n1",
                output: "1",
                explanation: "A single-node tree has depth 1.",
            },
        ],
        hidden: [
            { input: "0", output: "0" },
        ],
        cppRef: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (root == nullptr) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
        pyRef: `class Solution:
    def maxDepth(self, root):
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
        javaRef: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`,
    }),

    mk({
        title: "Invert Binary Tree",
        difficulty: "easy",
        tags: "tree",
        description: `Given the root of a binary tree, invert the tree and return its root.

Input format:
- n
- n level-order values using -1 for null

Output format:
- level-order values of the inverted tree using -1 for null`,
        signature: {
            functionName: "invertTree",
            returnType: "TreeNode*",
            args: [{ name: "root", type: "TreeNode*" }],
        },
        visible: [
            {
                input: "7\n4 2 7 1 3 6 9",
                output: "4 7 2 9 6 3 1",
                explanation: "Each node's left and right children are swapped.",
            },
            {
                input: "0",
                output: "",
                explanation: "An empty tree remains empty.",
            },
        ],
        hidden: [
            { input: "1\n2", output: "2" },
        ],
        cppRef: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (root == nullptr) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`,
        pyRef: `class Solution:
    def invertTree(self, root):
        if not root:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
        javaRef: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(temp);
        return root;
    }
}`,
    }),

    mk({
        title: "Validate Binary Search Tree",
        difficulty: "medium",
        tags: "bst",
        description: `Given the root of a binary tree, return true if it is a valid binary search tree, otherwise return false.

Input format:
- n
- n level-order values using -1 for null

Output format:
- true or false`,
        signature: {
            functionName: "isValidBST",
            returnType: "bool",
            args: [{ name: "root", type: "TreeNode*" }],
        },
        visible: [
            {
                input: "3\n2 1 3",
                output: "true",
                explanation: "All nodes satisfy BST ordering.",
            },
            {
                input: "7\n5 1 4 -1 -1 3 6",
                output: "false",
                explanation: "Node 3 is in the right subtree of 5 but is smaller than 5.",
            },
        ],
        hidden: [
            { input: "0", output: "true" },
            { input: "3\n2 2 3", output: "false" },
        ],
        cppRef: `class Solution {
public:
    bool dfs(TreeNode* node, long long lo, long long hi) {
        if (node == nullptr) return true;
        if (node->val <= lo || node->val >= hi) return false;
        return dfs(node->left, lo, node->val) && dfs(node->right, node->val, hi);
    }

    bool isValidBST(TreeNode* root) {
        return dfs(root, LLONG_MIN, LLONG_MAX);
    }
};`,
        pyRef: `class Solution:
    def isValidBST(self, root):
        def dfs(node, lo, hi):
            if not node:
                return True
            if node.val <= lo or node.val >= hi:
                return False
            return dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)

        return dfs(root, float("-inf"), float("inf"))`,
        javaRef: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean dfs(TreeNode node, long lo, long hi) {
        if (node == null) return true;
        if (node.val <= lo || node.val >= hi) return false;
        return dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi);
    }
}`,
    }),

    mk({
        title: "Lowest Common Ancestor in BST",
        difficulty: "medium",
        tags: "bst",
        description: `Given the root of a binary search tree and two node values p and q, return the value of their lowest common ancestor.

Input format:
- n
- n level-order values using -1 for null
- p
- q

Output format:
- a single integer`,
        signature: {
            functionName: "lcaBstValue",
            returnType: "int",
            args: [
                { name: "root", type: "TreeNode*" },
                { name: "p", type: "int" },
                { name: "q", type: "int" },
            ],
        },
        visible: [
            {
                input: "7\n6 2 8 0 4 7 9\n2\n8",
                output: "6",
                explanation: "The split point is the root.",
            },
            {
                input: "7\n6 2 8 0 4 7 9\n2\n4",
                output: "2",
                explanation: "Node 2 is an ancestor of node 4.",
            },
        ],
        hidden: [
            { input: "3\n2 1 3\n1\n3", output: "2" },
            { input: "7\n6 2 8 0 4 7 9\n8\n2", output: "6" },
        ],
        cppRef: `class Solution {
public:
    int lcaBstValue(TreeNode* root, int p, int q) {
        TreeNode* cur = root;
        while (cur != nullptr) {
            if (p < cur->val && q < cur->val) {
                cur = cur->left;
            } else if (p > cur->val && q > cur->val) {
                cur = cur->right;
            } else {
                return cur->val;
            }
        }
        return -1;
    }
};`,
        pyRef: `class Solution:
    def lcaBstValue(self, root, p, q):
        cur = root
        while cur:
            if p < cur.val and q < cur.val:
                cur = cur.left
            elif p > cur.val and q > cur.val:
                cur = cur.right
            else:
                return cur.val
        return -1`,
        javaRef: `class Solution {
    public int lcaBstValue(TreeNode root, int p, int q) {
        TreeNode cur = root;
        while (cur != null) {
            if (p < cur.val && q < cur.val) {
                cur = cur.left;
            } else if (p > cur.val && q > cur.val) {
                cur = cur.right;
            } else {
                return cur.val;
            }
        }
        return -1;
    }
}`,
    }),
];

runSeedCli(problems);