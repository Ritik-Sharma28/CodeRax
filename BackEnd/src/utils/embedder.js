/**
 * Singleton embedding pipeline using Transformers.js
 * Model: Xenova/all-MiniLM-L6-v2 (384 dimensions, ~80MB)
 * 
 * Usage:
 *   import { initEmbedder, getEmbedding } from './embedder.js';
 *   await initEmbedder();           // call once at server startup
 *   const vec = await getEmbedding("some text");  // returns number[]
 */

let pipelineInstance = null;
let initPromise = null;

/**
 * Initialize the embedding pipeline (downloads model on first run).
 * Safe to call multiple times — only the first call does work.
 */
export async function initEmbedder() {
    if (pipelineInstance) return pipelineInstance;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('⏳ Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
            const { pipeline } = await import('@xenova/transformers');

            pipelineInstance = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2',
                { quantized: true }
            );

            console.log('✅ Embedder initialized successfully');
            return pipelineInstance;
        } catch (err) {
            initPromise = null; // allow retry on failure
            console.error('❌ Failed to initialize embedder:', err.message);
            throw err;
        }
    })();

    return initPromise;
}

/**
 * Generate a 384-dimension embedding for the given text.
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - Array of 384 floats
 */
export async function getEmbedding(text) {
    if (!pipelineInstance) {
        await initEmbedder();
    }

    const output = await pipelineInstance(text, {
        pooling: 'mean',
        normalize: true
    });

    // output.data is a Float32Array — convert to plain array for MongoDB
    return Array.from(output.data);
}
