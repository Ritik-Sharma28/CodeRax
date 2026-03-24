
const generateInputReader = (args) => {
    let code = "";
    args.forEach(arg => {
        if (arg.type === "int") {
            code += `        ${arg.name} = int(sys.stdin.readline())\n`;
        } else if (arg.type === "long long") {
            code += `        ${arg.name} = int(sys.stdin.readline())\n`;
        } else if (arg.type === "double") {
            code += `        ${arg.name} = float(sys.stdin.readline())\n`;
        } else if (arg.type === "list[int]" || arg.type === "vector<int>") {
            code += `        n_${arg.name} = int(sys.stdin.readline())\n`;
            code += `        ${arg.name} = list(map(int, sys.stdin.readline().split()))\n`;
        } else if (arg.type === "string") {
            code += `        ${arg.name} = sys.stdin.readline().strip()\n`;
        } else if (arg.type === "vector<string>") {
            code += `        n_${arg.name} = int(sys.stdin.readline())\n`;
            code += `        ${arg.name} = [sys.stdin.readline().strip() for _ in range(n_${arg.name})]\n`;
        } else if (arg.type === "vector<vector<int>>" || arg.type === "list[list[int]]") {
            code += `        r_${arg.name}, c_${arg.name} = map(int, sys.stdin.readline().split())\n`;
            code += `        ${arg.name} = [list(map(int, sys.stdin.readline().split())) for _ in range(r_${arg.name})]\n`;
        } else if (arg.type === "ListNode*") {
            code += `        n_${arg.name} = int(sys.stdin.readline())\n`;
            code += `        vals_${arg.name} = list(map(int, sys.stdin.readline().split())) if n_${arg.name} else []\n`;
            code += `        ${arg.name} = build_list(vals_${arg.name})\n`;
        } else if (arg.type === "TreeNode*") {
            code += `        n_${arg.name} = int(sys.stdin.readline())\n`;
            code += `        vals_${arg.name} = list(map(int, sys.stdin.readline().split())) if n_${arg.name} else []\n`;
            code += `        ${arg.name} = build_tree(vals_${arg.name})\n`;
        }
    });
    return code;
};

export const generatePythonCode = (userCode, problemSignature) => {
    const { functionName, returnType, args } = problemSignature;

    const reader = generateInputReader(args);
    const call = `result = sol.${functionName}(${args.map(a => a.name).join(", ")})`;

    // Output formatting
    let printer = `print(result)`;
    if (returnType === "list[int]" || returnType === "vector<int>") {
        printer = `print(" ".join(map(str, result)))`;
    } else if (returnType === "vector<string>") {
        printer = `print(" ".join(result))`;
    } else if (returnType === "bool") {
        printer = `print("true" if result else "false")`;
    } else if (returnType === "double") {
        printer = `print(f"{float(result):.6f}")`;
    } else if (returnType === "ListNode*") {
        printer = `print(" ".join(map(str, serialize_list(result))))`;
    } else if (returnType === "TreeNode*") {
        printer = `print(" ".join(map(str, serialize_tree(result))))`;
    }

    return `import sys
from typing import List
from collections import deque

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for x in vals:
        cur.next = ListNode(x)
        cur = cur.next
    return dummy.next

def serialize_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def build_tree(vals, null_sentinel=-1):
    if not vals or vals[0] == null_sentinel:
        return None
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] != null_sentinel:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != null_sentinel:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root

def serialize_tree(root, null_sentinel=-1):
    if not root:
        return []
    out = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(null_sentinel)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] == null_sentinel:
        out.pop()
    return out

# User Code
${userCode}

if __name__ == "__main__":
    line = sys.stdin.readline()
    if not line:
        exit(0)
    T = int(line.strip())
    
    sol = Solution()
    
    for _ in range(T):
${reader}
        ${call}
        ${printer}
`;
}
