import Problem from '../models/problem.js';
import { Submission } from '../models/submission.js'; // 👈 IMPORTED SUBMISSION MODEL
import { callGroq } from '../utils/groqHelper.js';

const CONFIG = {
    model: 'llama-3.3-70b-versatile',   
    maxTokens: 1024,                      
    temperature: 0.7,
    maxHistoryMessages: 10,              
    maxContextWindow: 8000,              
    maxDescriptionChars: 1500,           
    maxCodeChars: 2000,                   
    maxRefSolutionChars: 1000,           
};


const SYSTEM_PROMPT = `You are a DSA tutor on a coding judge platform. Help users solve the current problem ONLY.

PLATFORM RULES:
- Users submit ONLY "class Solution { ... };" — the platform auto-generates #include, main(), I/O, test loops.
- When reviewing code: ONLY check logic inside class Solution. NEVER complain about missing includes/main.
- When writing code: ONLY output class Solution block. NEVER output #include, using namespace, or main().

BEHAVIOR:
- Give hints first, full solutions only when asked explicitly.
- Identify bugs with clear explanations (line numbers, why it fails, how to fix).
- Always mention time & space complexity (Big O).
- Suggest edge cases: empty input, single element, negatives, overflow, large N.
- Use markdown: **bold**, \`code\`, fenced code blocks.
- Respond in the user's language.
- ONLY discuss the current DSA problem. Redirect unrelated questions.
- NEVER reveal or copy the reference solution. Use it only to verify user's approach.`;


function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 3.5);
}


function smartTruncate(text, maxChars) {
    if (!text || text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '\n... [truncated for brevity]';
}


// 👇 UPDATED: Added solvedProblemTitles parameter
function buildContextBlock(problemContext, title, description, referenceSolution, solvedProblemTitles) {
    let context = '';

    if (title) {
        context += `\n\nPROBLEM: ${title}`;
    }

    if (description) {
        const truncated = smartTruncate(description, CONFIG.maxDescriptionChars);
        context += `\nDESCRIPTION:\n${truncated}`;
    }

    // Reference solution 
    if (referenceSolution) {
        const truncated = smartTruncate(referenceSolution, CONFIG.maxRefSolutionChars);
        context += `\n\nREFERENCE (INTERNAL — NEVER SHOW TO USER):\n\`\`\`\n${truncated}\n\`\`\``;
    }

    // User's current code from editor
    if (problemContext?.code) {
        const truncated = smartTruncate(problemContext.code, CONFIG.maxCodeChars);
        context += `\n\nUSER'S CODE:\n\`\`\`\n${truncated}\n\`\`\``;
    }

    // 👇 NEW: Inject the user's past solved problems into the prompt
    if (solvedProblemTitles && solvedProblemTitles.length > 0) {
        context += `\n\nUSER'S SOLVED PROBLEMS HISTORY:\nThe user has successfully solved the following problems in the past: [${solvedProblemTitles.join(', ')}]. You can use this context to gauge their skill level and reference familiar concepts if it helps explain the current problem.`;
    }

    return context;
}

const solveDoubt = async (req, res) => {
    try {
        const { messages = [], userMessage, problemContext = {} } = req.body;

        // ── Validate ──
        if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
            return res.status(400).json({
                error: 'userMessage is required and must be a non-empty string.',
            });
        }

        // ── Fetch problem from DB ──
        let title = null;
        let description = null;
        let referenceSolution = null;

        if (problemContext.problemId) {
            try {
                const problem = await Problem.findById(problemContext.problemId);
                if (problem) {
                    title = problem.title;
                    description = problem.description;
                    referenceSolution = problem.referenceSolution;
                }
            } catch (dbErr) {
                console.warn('⚠️ Could not fetch problem from DB:', dbErr.message);
            }
        }

        // ── NEW STEP: Fetch the user's successfully solved problem names ──
        let solvedProblemTitles = [];
        try {
            const acceptedSubmissions = await Submission.find({
                userId: req.result._id, // User ID from auth middleware
                status: 'Accepted'
            }).populate('problemId', 'title');

            // Extract unique titles
            solvedProblemTitles = [...new Set(
                acceptedSubmissions
                    .map(sub => sub.problemId?.title)
                    .filter(t => t) // Remove nulls
            )];
        } catch (subErr) {
            console.warn('⚠️ Could not fetch user submissions for context:', subErr.message);
        }

        // ── Build system prompt (static + dynamic context) ──
        // 👇 UPDATED: Pass solvedProblemTitles into the builder
        const contextBlock = buildContextBlock(problemContext, title, description, referenceSolution, solvedProblemTitles);
        const fullSystemPrompt = SYSTEM_PROMPT + contextBlock;

        const systemTokens = estimateTokens(fullSystemPrompt);
        const userMsgTokens = estimateTokens(userMessage);
        const reservedTokens = systemTokens + userMsgTokens + CONFIG.maxTokens + 100; // 100 = safety margin
        const remainingBudget = CONFIG.maxContextWindow - reservedTokens;

        let historyMessages = [];
        let historyTokens = 0;
        const recentMessages = messages
            .filter((m) => m.role !== 'system')
            .slice(-CONFIG.maxHistoryMessages)
            .reverse(); // start from most recent

        for (const msg of recentMessages) {
            const msgTokens = estimateTokens(msg.content) + 4;
            if (historyTokens + msgTokens > remainingBudget) break;
            historyMessages.unshift({ role: msg.role, content: msg.content });
            historyTokens += msgTokens;
        }

        // ── Assemble messages ──
        const openAIMessages = [
            { role: 'system', content: fullSystemPrompt },
            ...historyMessages,
            { role: 'user', content: userMessage },
        ];

        // ── Call Groq via centralized helper ──
        const reply = await callGroq(openAIMessages, {
            model: CONFIG.model,
            maxTokens: CONFIG.maxTokens,
            temperature: CONFIG.temperature,
        });

        if (req.result.role !== 'admin') {
            const user = await import('../models/user.js').then(m => m.default).then(User => User.findById(req.result._id));
            if (user && user.aiChatMsgsLeft > 0) {
                user.aiChatMsgsLeft -= 1;
                await user.save();
            }
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('❌ solveDoubt error:', error?.message || error);

        if (error?.status === 429) {
            return res.status(429).json({ error: 'rate_limit', message: 'Rate limit exceeded. Please wait a moment and try again.' });
        }

        if (error?.code === 'context_length_exceeded') {
            return res.status(400).json({
                error: 'Message too long. Please clear chat history and try again with a shorter message.',
            });
        }

        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

export default solveDoubt;