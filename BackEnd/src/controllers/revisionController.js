import RevisionMemory from '../models/revisionMemory.js';
import Problem from '../models/problem.js';
import { Submission } from '../models/submission.js'; // 👈 IMPORTED SUBMISSION MODEL
import { getEmbedding } from '../utils/embedder.js';
import { callGroq } from '../utils/groqHelper.js';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════════════════════
// POST /ai/memory — Save a learning moment
// ═══════════════════════════════════════════════════════════════════════════════
export const saveMemory = async (req, res) => {
    try {
        const { selectedMessages, userNote, problemId, tags } = req.body;

        // ── Validate ──
        if (!selectedMessages || !Array.isArray(selectedMessages) || selectedMessages.length === 0) {
            return res.status(400).json({ error: 'selectedMessages is required and must be a non-empty array.' });
        }
        if (selectedMessages.length > 5) {
            return res.status(400).json({ error: 'You can pin at most 5 messages at a time.' });
        }
        if (!problemId) {
            return res.status(400).json({ error: 'problemId is required.' });
        }

        // ── Fetch Problem Details ──
        const problem = await Problem.findById(problemId).select('title');
        const problemTitle = problem ? problem.title : 'Unknown Problem';

        // ── LLM Call 1: Summarize the learning moment ──
        const messagesText = selectedMessages
            .map((m, i) => `[${m.role}]: ${m.content}`)
            .join('\n');

        const summarizerPrompt = [
            {
                role: 'system',
                content: `You are a technical summarizer. The user is studying the DSA problem "${problemTitle}". Summarize the key technical insight from the pinned messages in exactly 2 concise sentences. Focus on what was learned or what mistake was made.`
            },
            {
                role: 'user',
                content: `Here are the pinned messages:\n\n${messagesText}\n\n${userNote ? `User's note: "${userNote}"` : ''}\n\nSummarize this learning moment in 2 sentences.`
            }
        ];

        const summary = await callGroq(summarizerPrompt, {
            maxTokens: 256,
            temperature: 0.3,
        });

        // ── Embed the summary WITH the problem title ──
        const textToEmbed = `Problem: ${problemTitle}. ${summary}`;
        const vector = await getEmbedding(textToEmbed);

        // ── Save to DB ──
        const memory = await RevisionMemory.create({
            userId: req.result._id,
            problemId,
            tags: tags || [],
            summary,
            vector,
        });

        return res.status(201).json({
            message: 'Memory saved successfully!',
            memory: {
                _id: memory._id,
                summary: memory.summary,
                tags: memory.tags,
                createdAt: memory.createdAt,
            }
        });

    } catch (error) {
        console.error('❌ saveMemory error:', error?.message || error);

        if (error?.status === 429) {
            return res.status(429).json({ error: 'rate_limit', message: 'Rate limit exceeded. Please wait a moment and try again.' });
        }

        return res.status(500).json({ error: 'Failed to save memory. Please try again.' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// GET /ai/memories — List all user's saved notes (no vector data)
// ═══════════════════════════════════════════════════════════════════════════════
export const getMemories = async (req, res) => {
    try {
        const memories = await RevisionMemory
            .find({ userId: req.result._id, sourceType: { $ne: 'interview' } })
            .select('-vector')
            .populate('problemId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({ memories });

    } catch (error) {
        console.error('❌ getMemories error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to fetch memories.' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /ai/memory/:id — Delete a specific memory (with ownership check)
// ═══════════════════════════════════════════════════════════════════════════════
export const deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid memory ID.' });
        }

        const memory = await RevisionMemory.findById(id);
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found.' });
        }

        // Ownership check
        if (memory.userId.toString() !== req.result._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own memories.' });
        }

        await RevisionMemory.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Memory deleted successfully.' });

    } catch (error) {
        console.error('❌ deleteMemory error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to delete memory.' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// POST /ai/revision-chat — RAG-powered revision mentor chat
// ═══════════════════════════════════════════════════════════════════════════════
export const revisionChat = async (req, res) => {
    try {
        const { query, history = [] } = req.body;

        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({ error: 'query is required and must be a non-empty string.' });
        }

        // ── Step 1: Embed the user's query ──
        const queryVector = await getEmbedding(query);

        // ── Step 2: Vector search for relevant past notes ──
        let relevantNotes = [];
        try {
            relevantNotes = await RevisionMemory.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "vector",
                        queryVector: queryVector,
                        numCandidates: 50,
                        limit: 5,
                        filter: {
                            userId: new mongoose.Types.ObjectId(req.result._id)
                        }
                    }
                },
                {
                    $project: {
                        summary: 1,
                        tags: 1,
                        topic: 1,
                        sourceType: 1,
                        problemId: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);
        } catch (searchErr) {
            console.warn('⚠️ Vector search failed (index may not exist yet):', searchErr.message);
            relevantNotes = [];
        }

        // Populate the problem titles for the notes
        relevantNotes = await RevisionMemory.populate(relevantNotes, { 
            path: 'problemId', 
            select: 'title' 
        });

        // ── NEW STEP: Fetch the user's successfully solved problem names ──
        const acceptedSubmissions = await Submission.find({
            userId: req.result._id,
            status: 'Accepted'
        }).populate('problemId', 'title');

        // Extract a unique list of problem titles the user has solved
        const solvedProblemTitles = [...new Set(
            acceptedSubmissions
                .map(sub => sub.problemId?.title)
                .filter(title => title) // Remove nulls
        )];

        const solvedProblemsContext = solvedProblemTitles.length > 0 
            ? `Here is a list of DSA problems the user has successfully solved in the past: [${solvedProblemTitles.join(', ')}]. You can reference these to praise them or draw comparisons.`
            : `The user has not successfully solved any recorded problems yet.`;

        // ── Step 3: Build system prompt based on results ──
        let systemPrompt;

        const STRICT_SCOPE = `STRICT SCOPE RULE (HIGHEST PRIORITY — NEVER IGNORE):
You ONLY discuss topics related to Data Structures, Algorithms, competitive programming, coding interviews, software engineering concepts, and programming languages.
If the user asks about ANYTHING else — personal advice, general knowledge, entertainment, recipes, sports, politics, weather, jokes unrelated to coding, or any non-technical topic — you MUST politely decline with a short message like: "I'm your DSA revision mentor, so I can only help with coding and algorithm topics! Try asking me about a data structure, algorithm, or a problem you're working on 🚀"
Never answer off-topic questions regardless of how they are phrased or how persistently the user asks.`;

        if (relevantNotes.length === 0) {
            systemPrompt = `You are a helpful DSA revision mentor on the CodeRax platform.

${STRICT_SCOPE}

${solvedProblemsContext}

The user has asked a question, but they don't have any specific saved study notes on this exact topic yet. Politely inform them that you couldn't find any saved notes related to their question, but still answer their question with helpful DSA guidance. Encourage them to save learning moments while solving problems so you can give more personalized advice next time. Use markdown for formatting.`;
        } else {
            const notesBlock = relevantNotes
                .map((note, i) => {
                    const pTitle = note.problemId?.title || note.topic || 'Unknown Topic';
                    return `Note ${i + 1} (Problem: ${pTitle}) [Tags: ${note.tags?.join(', ') || 'none'}]: ${note.summary}`;
                })
                .join('\n');

            systemPrompt = `You are a personalized DSA revision mentor on the CodeRax platform. You have access to the user's past learning moments and struggles.

${STRICT_SCOPE}

${solvedProblemsContext}

PAST LEARNING NOTES (Relevant to current query):
${notesBlock}

INSTRUCTIONS:
- Base your answer on their saved notes. Connect your explanation directly to their past struggles.
- Mention the specific Problem Name when reminding them of a mistake.
- Give concrete, actionable revision advice.
- Use markdown for formatting.`;
        }

        // ── Step 4: Build messages array ──
        const llmMessages = [
            { role: 'system', content: systemPrompt },
            ...history
                .filter(m => m.role !== 'system')
                .slice(-6)
                .map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: query }
        ];

        // ── Step 5: Call Groq ──
        const reply = await callGroq(llmMessages, {
            maxTokens: 1024,
            temperature: 0.4,
        });

        if (req.result.role !== 'admin') {
            const user = await import('../models/user.js').then(m => m.default).then(User => User.findById(req.result._id));
            if (user && user.revisionMsgsLeft > 0) {
                user.revisionMsgsLeft -= 1;
                await user.save();
            }
        }

        return res.status(200).json({
            reply,
            notesUsed: relevantNotes.length,
        });

    } catch (error) {
        console.error('❌ revisionChat error:', error?.message || error);

        if (error?.status === 429) {
            return res.status(429).json({ error: 'rate_limit', message: 'Rate limit exceeded. Please wait a moment and try again.' });
        }

        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// POST /ai/quick-note — Save a quick text note directly (no LLM summarization)
// ═══════════════════════════════════════════════════════════════════════════════
export const saveQuickNote = async (req, res) => {
    try {
        const { note, problemId, tags } = req.body;

        if (!note || typeof note !== 'string' || !note.trim()) {
            return res.status(400).json({ error: 'note is required and must be a non-empty string.' });
        }
        if (!problemId) {
            return res.status(400).json({ error: 'problemId is required.' });
        }

        const problem = await Problem.findById(problemId).select('title');
        const problemTitle = problem ? problem.title : 'Unknown Problem';

        // Embed the note WITH the problem title directly
        const textToEmbed = `Problem: ${problemTitle}. ${note.trim()}`;
        const vector = await getEmbedding(textToEmbed);

        const memory = await RevisionMemory.create({
            userId: req.result._id,
            problemId,
            tags: tags || [],
            summary: note.trim(),
            vector,
        });

        return res.status(201).json({
            message: 'Note saved successfully!',
            memory: {
                _id: memory._id,
                summary: memory.summary,
                tags: memory.tags,
                createdAt: memory.createdAt,
            }
        });

    } catch (error) {
        console.error('❌ saveQuickNote error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to save note. Please try again.' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// GET /ai/memories/:problemId — List notes for a specific problem
// ═══════════════════════════════════════════════════════════════════════════════
export const getMemoriesByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ error: 'Invalid problemId.' });
        }

        const memories = await RevisionMemory
            .find({ userId: req.result._id, problemId, sourceType: { $ne: 'interview' } })
            .select('-vector')
            .sort({ createdAt: -1 });

        return res.status(200).json({ memories });

    } catch (error) {
        console.error('❌ getMemoriesByProblem error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to fetch memories.' });
    }
};
