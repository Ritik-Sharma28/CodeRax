
const generateInputReader = (args) => {
    let readerCode = "";
    args.forEach((arg) => {
        if (arg.type === "int") {
            readerCode += `
        int ${arg.name};
        cin >> ${arg.name};
      `;
        } else if (arg.type === "vector<int>") {
            readerCode += `
        int n_${arg.name};
        cin >> n_${arg.name};
        vector<int> ${arg.name}(n_${arg.name});
        for(int i = 0; i < n_${arg.name}; i++) cin >> ${arg.name}[i];
      `;
        } else if (arg.type === "long long") {
            readerCode += `
        long long ${arg.name};
        cin >> ${arg.name};
      `;
        } else if (arg.type === "double") {
            readerCode += `
        double ${arg.name};
        cin >> ${arg.name};
      `;
        } else if (arg.type === "string") {
            readerCode += `
        string ${arg.name};
        cin >> ${arg.name};
      `;
        } else if (arg.type === "vector<string>") {
            readerCode += `
        int n_${arg.name};
        cin >> n_${arg.name};
        vector<string> ${arg.name}(n_${arg.name});
        for(int i = 0; i < n_${arg.name}; i++) cin >> ${arg.name}[i];
      `;
        } else if (arg.type === "vector<vector<int>>") {
            readerCode += `
        int r_${arg.name}, c_${arg.name};
        cin >> r_${arg.name} >> c_${arg.name};
        vector<vector<int>> ${arg.name}(r_${arg.name}, vector<int>(c_${arg.name}));
        for(int i = 0; i < r_${arg.name}; i++) {
            for(int j = 0; j < c_${arg.name}; j++) cin >> ${arg.name}[i][j];
        }
      `;
        } else if (arg.type === "ListNode*") {
            readerCode += `
        int n_${arg.name};
        cin >> n_${arg.name};
        vector<int> vals_${arg.name}(n_${arg.name});
        for (int i = 0; i < n_${arg.name}; i++) cin >> vals_${arg.name}[i];
        ListNode* ${arg.name} = buildList(vals_${arg.name});
      `;
        } else if (arg.type === "TreeNode*") {
            readerCode += `
        int n_${arg.name};
        cin >> n_${arg.name};
        vector<int> vals_${arg.name}(n_${arg.name});
        for (int i = 0; i < n_${arg.name}; i++) cin >> vals_${arg.name}[i];
        TreeNode* ${arg.name} = buildTree(vals_${arg.name});
      `;
        }
    });
    return readerCode;
};

const generateFunctionCall = (functionName, args) => {
    const argNames = args.map(arg => arg.name).join(", ");
    return `sol.${functionName}(${argNames})`;
}

const generateOutputPrinter = (returnType) => {
    if (returnType === "vector<int>") {
        return `
        for(int i=0; i<result.size(); i++) {
            cout << result[i] << (i == result.size() - 1 ? "" : " ");
        }
        cout << endl;
        `;
    } else if (returnType === "int") {
        return `cout << result << endl;`;
    } else if (returnType === "long long") {
        return `cout << result << endl;`;
    } else if (returnType === "double") {
        return `
        cout.setf(std::ios::fixed);
        cout << setprecision(6) << result << endl;
        `;
    } else if (returnType === "bool") {
        return `cout << (result ? "true" : "false") << endl;`;
    } else if (returnType === "string") {
        return `cout << result << endl;`;
    } else if (returnType === "vector<string>") {
        return `
        for(int i=0; i<result.size(); i++) {
            cout << result[i] << (i == result.size() - 1 ? "" : " ");
        }
        cout << endl;
        `;
    } else if (returnType === "ListNode*") {
        return `printList(result);`;
    } else if (returnType === "TreeNode*") {
        return `printTree(result);`;
    }
    return `cout << result << endl;`;
}

export const generateCppCode = (userCode, problemSignature) => {
    const { functionName, returnType, args } = problemSignature;

    const inputReader = generateInputReader(args);
    const functionCall = generateFunctionCall(functionName, args);
    const outputPrinter = generateOutputPrinter(returnType);

    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <iomanip>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* n) : val(x), next(n) {}
};

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode* l, TreeNode* r) : val(x), left(l), right(r) {}
};

ListNode* buildList(const vector<int>& vals) {
    ListNode dummy(0);
    ListNode* cur = &dummy;
    for (int x : vals) {
        cur->next = new ListNode(x);
        cur = cur->next;
    }
    return dummy.next;
}

void printList(ListNode* head) {
    bool first = true;
    while (head) {
        if (!first) cout << " ";
        cout << head->val;
        first = false;
        head = head->next;
    }
    cout << endl;
}

TreeNode* buildTree(const vector<int>& vals, int nullSentinel = -1) {
    if (vals.empty() || vals[0] == nullSentinel) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)vals.size()) {
        TreeNode* cur = q.front();
        q.pop();
        if (i < (int)vals.size() && vals[i] != nullSentinel) {
            cur->left = new TreeNode(vals[i]);
            q.push(cur->left);
        }
        i++;
        if (i < (int)vals.size() && vals[i] != nullSentinel) {
            cur->right = new TreeNode(vals[i]);
            q.push(cur->right);
        }
        i++;
    }
    return root;
}

void printTree(TreeNode* root, int nullSentinel = -1) {
    if (!root) {
        cout << endl;
        return;
    }
    vector<int> out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* cur = q.front();
        q.pop();
        if (!cur) {
            out.push_back(nullSentinel);
            continue;
        }
        out.push_back(cur->val);
        q.push(cur->left);
        q.push(cur->right);
    }
    while (!out.empty() && out.back() == nullSentinel) out.pop_back();
    for (int i = 0; i < (int)out.size(); i++) {
        if (i) cout << " ";
        cout << out[i];
    }
    cout << endl;
}

${userCode}

int main() {
    int T;
    if (!(cin >> T)) return 0;
    
    Solution sol;
    
    while(T--) {
        ${inputReader}
        
        ${returnType} result = ${functionCall};
        
        ${outputPrinter}
    }
    return 0;
}
`;
};
