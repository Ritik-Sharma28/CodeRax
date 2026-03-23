/**
 * Centralized Groq API helper
 * Wraps all LLM calls with proper error handling + 429 rate limit detection.
 */

import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// ──────────────────────────────────────────────────────────────────────────────
// EDIT THIS LINE TO SIMULATE RATE LIMITS FOR TESTING
const SIMULATE_RATE_LIMIT = false;
// Set to `true`, restart server, then try any AI feature → you'll get the 429 UI
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Call the Groq LLM with the given messages.
 * 
 * @param {Array<{role: string, content: string}>} messages - OpenAI-format messages
 * @param {object} opts
 * @param {string}  [opts.model='llama-3.3-70b-versatile']
 * @param {number}  [opts.maxTokens=1024]
 * @param {number}  [opts.temperature=0.7]
 * @returns {Promise<string>} - The assistant's reply text
 * @throws {object} - Throws with { status: 429 } on rate limit
 */
export async function callGroq(messages, opts = {}) {
    const {
        model = 'llama-3.3-70b-versatile',
        maxTokens = 1024,
        temperature = 0.7,
    } = opts;

    // ── Simulate rate limit for testing ──
    if (SIMULATE_RATE_LIMIT) {
        const err = new Error('Simulated 429 rate limit');
        err.status = 429;
        throw err;
    }

    try {
        const completion = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
        });

        const reply = completion.choices[0]?.message?.content;

        if (!reply) {
            throw new Error('AI returned an empty response');
        }

        if (completion.usage) {
            console.log(`✅ Groq usage: prompt=${completion.usage.prompt_tokens} completion=${completion.usage.completion_tokens} total=${completion.usage.total_tokens}`);
        }

        return reply;

    } catch (error) {
        // Re-throw rate limit errors with a recognizable status
        if (error?.status === 429) {
            const rateLimitErr = new Error('Rate limit exceeded. Please wait a moment and try again.');
            rateLimitErr.status = 429;
            throw rateLimitErr;
        }

        // Re-throw context length errors
        if (error?.code === 'context_length_exceeded' || error?.error?.code === 'context_length_exceeded') {
            const ctxErr = new Error('Message too long. Please clear chat history and try again.');
            ctxErr.status = 400;
            ctxErr.code = 'context_length_exceeded';
            throw ctxErr;
        }

        // Re-throw auth errors
        if (error?.status === 401 || error?.code === 'invalid_api_key') {
            const authErr = new Error('Invalid API key. Check server configuration.');
            authErr.status = 500;
            throw authErr;
        }

        // Generic error
        throw error;
    }
}
