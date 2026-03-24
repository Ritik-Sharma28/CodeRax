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

const mk = ({ title, description, difficulty, tags, signature, visible, hidden, cppRef, pyRef }) => ({
  title,
  description,
  difficulty,
  tags,
  judgeConfig: { outputMode: "token", floatTolerance: 0.000001 },
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

const advanced = [
  mk({
    title: "Middle Node of Linked List",
    difficulty: "easy",
    tags: "linkedList",
    description: `Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.

Input format:
- n
- n space separated node values

Output format:
- linked list starting from the returned middle node (space separated values).`,
    signature: {
      functionName: "middleNode",
      returnType: "ListNode*",
      args: [{ name: "head", type: "ListNode*" }],
    },
    visible: [
      { input: "5\n1 2 3 4 5", output: "3 4 5", explanation: "Middle is node with value 3." },
      { input: "6\n1 2 3 4 5 6", output: "4 5 6", explanation: "Second middle is node 4." },
    ],
    hidden: [{ input: "1\n9", output: "9" }],
    cppRef: `class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};`,
    pyRef: `class Solution:
    def middleNode(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow`,
  }),
  mk({
    title: "Merge Two Sorted Linked Lists",
    difficulty: "easy",
    tags: "linkedList",
    description: `You are given two sorted linked lists. Merge them into one sorted linked list and return its head.

Input format per testcase:
- n1 then n1 values for list1
- n2 then n2 values for list2

Output:
- merged sorted linked list values.`,
    signature: {
      functionName: "mergeTwoLists",
      returnType: "ListNode*",
      args: [
        { name: "list1", type: "ListNode*" },
        { name: "list2", type: "ListNode*" },
      ],
    },
    visible: [
      { input: "3\n1 2 4\n3\n1 3 4", output: "1 1 2 3 4 4", explanation: "Standard merge." },
      { input: "0\n\n0\n", output: "", explanation: "Both empty." },
    ],
    hidden: [{ input: "0\n\n3\n2 5 7", output: "2 5 7" }],
    cppRef: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* cur = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                cur->next = list1;
                list1 = list1->next;
            } else {
                cur->next = list2;
                list2 = list2->next;
            }
            cur = cur->next;
        }
        cur->next = list1 ? list1 : list2;
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
  }),
  mk({
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    tags: "tree",
    description: `Given the root of a binary tree, return its maximum depth.

Tree input format uses level order with -1 as null marker:
- n
- n values`,
    signature: {
      functionName: "maxDepth",
      returnType: "int",
      args: [{ name: "root", type: "TreeNode*" }],
    },
    visible: [
      { input: "7\n3 9 20 -1 -1 15 7", output: "3", explanation: "Tree depth is 3." },
      { input: "1\n1", output: "1", explanation: "Single node tree." },
    ],
    hidden: [{ input: "0\n", output: "0" }],
    cppRef: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
    pyRef: `class Solution:
    def maxDepth(self, root):
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
  }),
  mk({
    title: "Invert Binary Tree",
    difficulty: "easy",
    tags: "tree",
    description: `Given the root of a binary tree, invert the tree and return its root.

Tree input/output is level order using -1 as null marker.`,
    signature: {
      functionName: "invertTree",
      returnType: "TreeNode*",
      args: [{ name: "root", type: "TreeNode*" }],
    },
    visible: [
      { input: "7\n4 2 7 1 3 6 9", output: "4 7 2 9 6 3 1", explanation: "Left and right children are swapped recursively." },
      { input: "0\n", output: "", explanation: "Empty tree remains empty." },
    ],
    hidden: [{ input: "1\n2", output: "2" }],
    cppRef: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
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
  }),
  mk({
    title: "Validate Binary Search Tree",
    difficulty: "medium",
    tags: "bst",
    description: `Return true if binary tree is a valid BST.

A BST requires all nodes in left subtree < node value < all nodes in right subtree.
Input tree uses level order with -1 null marker.`,
    signature: {
      functionName: "isValidBST",
      returnType: "bool",
      args: [{ name: "root", type: "TreeNode*" }],
    },
    visible: [
      { input: "3\n2 1 3", output: "true", explanation: "Valid BST." },
      { input: "5\n5 1 4 -1 -1 3 6", output: "false", explanation: "Right subtree contains 3 which is less than 5." },
    ],
    hidden: [{ input: "0\n", output: "true" }],
    cppRef: `class Solution {
public:
    bool dfs(TreeNode* n, long long lo, long long hi) {
        if (!n) return true;
        if (n->val <= lo || n->val >= hi) return false;
        return dfs(n->left, lo, n->val) && dfs(n->right, n->val, hi);
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
  }),
  mk({
    title: "Lowest Common Ancestor in BST",
    difficulty: "medium",
    tags: "bst",
    description: `Given root of BST and two values p and q, return value of their lowest common ancestor node.

Input format:
- n and level order values (-1 for null)
- p
- q`,
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
      { input: "7\n6 2 8 0 4 7 9\n2\n8", output: "6", explanation: "Root is LCA." },
      { input: "7\n6 2 8 0 4 7 9\n2\n4", output: "2", explanation: "Node 2 is ancestor of 4." },
    ],
    hidden: [{ input: "3\n2 1 3\n1\n3", output: "2" }],
    cppRef: `class Solution {
public:
    int lcaBstValue(TreeNode* root, int p, int q) {
        TreeNode* cur = root;
        while (cur) {
            if (p < cur->val && q < cur->val) cur = cur->left;
            else if (p > cur->val && q > cur->val) cur = cur->right;
            else return cur->val;
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
  }),
];

const seed = async () => {
  await main();
  const admin = await User.findOne({ role: "admin" }).select("_id");
  const fallbackUser = admin || (await User.findOne({}).select("_id"));
  if (!fallbackUser) {
    throw new Error("No user found. Create at least one user/admin before seeding problems.");
  }

  for (const p of advanced) {
    await Problem.updateOne(
      { title: p.title },
      { $set: { ...p, problemCreator: fallbackUser._id } },
      { upsert: true }
    );
  }

  console.log(`Seeded/updated ${advanced.length} advanced structure problems.`);
  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error("Advanced seed failed:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
