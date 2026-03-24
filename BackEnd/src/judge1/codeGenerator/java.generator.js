
const generateInputReader = (args) => {
    let readerCode = "";
    args.forEach((arg) => {
        if (arg.type === "int") {
            readerCode += `
            int ${arg.name} = sc.nextInt();
            `;
        } else if (arg.type === "vector<int>") {
            readerCode += `
            int n_${arg.name} = sc.nextInt();
            int[] ${arg.name} = new int[n_${arg.name}];
            for (int i = 0; i < n_${arg.name}; i++) ${arg.name}[i] = sc.nextInt();
            `;
        } else if (arg.type === "long long") {
            readerCode += `
            long ${arg.name} = sc.nextLong();
            `;
        } else if (arg.type === "double") {
            readerCode += `
            double ${arg.name} = sc.nextDouble();
            `;
        } else if (arg.type === "string") {
            readerCode += `
            String ${arg.name} = sc.next();
            `;
        } else if (arg.type === "vector<string>") {
            readerCode += `
            int n_${arg.name} = sc.nextInt();
            String[] ${arg.name} = new String[n_${arg.name}];
            for (int i = 0; i < n_${arg.name}; i++) ${arg.name}[i] = sc.next();
            `;
        } else if (arg.type === "vector<vector<int>>") {
            readerCode += `
            int r_${arg.name} = sc.nextInt();
            int c_${arg.name} = sc.nextInt();
            int[][] ${arg.name} = new int[r_${arg.name}][c_${arg.name}];
            for (int i = 0; i < r_${arg.name}; i++) {
                for (int j = 0; j < c_${arg.name}; j++) ${arg.name}[i][j] = sc.nextInt();
            }
            `;
        } else if (arg.type === "ListNode*") {
            readerCode += `
            int n_${arg.name} = sc.nextInt();
            int[] vals_${arg.name} = new int[n_${arg.name}];
            for (int i = 0; i < n_${arg.name}; i++) vals_${arg.name}[i] = sc.nextInt();
            ListNode ${arg.name} = buildList(vals_${arg.name});
            `;
        } else if (arg.type === "TreeNode*") {
            readerCode += `
            int n_${arg.name} = sc.nextInt();
            int[] vals_${arg.name} = new int[n_${arg.name}];
            for (int i = 0; i < n_${arg.name}; i++) vals_${arg.name}[i] = sc.nextInt();
            TreeNode ${arg.name} = buildTree(vals_${arg.name});
            `;
        }
    });
    return readerCode;
};

const generateFunctionCall = (functionName, args) => {
    const argNames = args.map(arg => arg.name).join(", ");
    return `sol.${functionName}(${argNames})`;
};

const getJavaReturnType = (returnType) => {
    switch (returnType) {
        case "vector<int>": return "int[]";
        case "vector<string>": return "String[]";
        case "vector<vector<int>>": return "int[][]";
        case "int": return "int";
        case "long long": return "long";
        case "double": return "double";
        case "bool": return "boolean";
        case "string": return "String";
        case "ListNode*": return "ListNode";
        case "TreeNode*": return "TreeNode";
        default: return returnType;
    }
};

const generateOutputPrinter = (returnType) => {
    if (returnType === "vector<int>") {
        return `
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < result.length; i++) {
                if (i > 0) sb.append(" ");
                sb.append(result[i]);
            }
            System.out.println(sb.toString());
        `;
    } else if (returnType === "int") {
        return `System.out.println(result);`;
    } else if (returnType === "long long") {
        return `System.out.println(result);`;
    } else if (returnType === "double") {
        return `System.out.printf("%.6f%n", result);`;
    } else if (returnType === "bool") {
        return `System.out.println(result ? "true" : "false");`;
    } else if (returnType === "string") {
        return `System.out.println(result);`;
    } else if (returnType === "vector<string>") {
        return `
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < result.length; i++) {
                if (i > 0) sb.append(" ");
                sb.append(result[i]);
            }
            System.out.println(sb.toString());
        `;
    } else if (returnType === "ListNode*") {
        return `printList(result);`;
    } else if (returnType === "TreeNode*") {
        return `printTree(result);`;
    }
    return `System.out.println(result);`;
};

export const generateJavaCode = (userCode, problemSignature) => {
    const { functionName, returnType, args } = problemSignature;

    const inputReader = generateInputReader(args);
    const functionCall = generateFunctionCall(functionName, args);
    const outputPrinter = generateOutputPrinter(returnType);
    const javaReturnType = getJavaReturnType(returnType);

    return `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() { this.val = 0; this.next = null; }
    ListNode(int x) { this.val = x; this.next = null; }
    ListNode(int x, ListNode n) { this.val = x; this.next = n; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() { this.val = 0; this.left = null; this.right = null; }
    TreeNode(int x) { this.val = x; this.left = null; this.right = null; }
    TreeNode(int x, TreeNode l, TreeNode r) { this.val = x; this.left = l; this.right = r; }
}

${userCode}

public class Main {

    static ListNode buildList(int[] vals) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int x : vals) {
            cur.next = new ListNode(x);
            cur = cur.next;
        }
        return dummy.next;
    }

    static void printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        while (head != null) {
            if (!first) sb.append(" ");
            sb.append(head.val);
            first = false;
            head = head.next;
        }
        System.out.println(sb.toString());
    }

    static TreeNode buildTree(int[] vals) {
        return buildTree(vals, -1);
    }

    static TreeNode buildTree(int[] vals, int nullSentinel) {
        if (vals.length == 0 || vals[0] == nullSentinel) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != nullSentinel) {
                cur.left = new TreeNode(vals[i]);
                q.add(cur.left);
            }
            i++;
            if (i < vals.length && vals[i] != nullSentinel) {
                cur.right = new TreeNode(vals[i]);
                q.add(cur.right);
            }
            i++;
        }
        return root;
    }

    static void printTree(TreeNode root) {
        printTree(root, -1);
    }

    static void printTree(TreeNode root, int nullSentinel) {
        if (root == null) {
            System.out.println();
            return;
        }
        List<Integer> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode cur = q.poll();
            if (cur == null) {
                out.add(nullSentinel);
                continue;
            }
            out.add(cur.val);
            q.add(cur.left);
            q.add(cur.right);
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == nullSentinel) out.remove(out.size() - 1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < out.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(out.get(i));
        }
        System.out.println(sb.toString());
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int T = sc.nextInt();

        Solution sol = new Solution();

        while (T-- > 0) {
            ${inputReader}

            ${javaReturnType} result = ${functionCall};

            ${outputPrinter}
        }
    }
}
`;
};
