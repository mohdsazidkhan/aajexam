import OpenAI from 'openai';

let client = null;

function getAIClient() {
    if (!client) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return null;

        client = new OpenAI({
            apiKey: apiKey,
            baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aajexam.com',
                'X-OpenRouter-Title': 'AajExam',
            },
        });
    }
    return client;
}

function getAvailableModels() {
    const models = [];
    for (let i = 1; i <= 5; i++) {
        const val = process.env[`AI_MODEL${i}`];
        if (val) models.push(val);
    }
    if (models.length === 0) {
        models.push(process.env.AI_MODEL || 'google/gemma-3-12b-it:free');
    }
    return models;
}

export async function generateCompletion(systemPrompt, messages, options = {}) {
    const openai = getAIClient();
    if (!openai) {
        return 'AI service is not configured. Please add OPENROUTER_API_KEY to .env';
    }

    const {
        temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 3000
    } = options;

    const models = getAvailableModels();
    let lastError = null;

    for (const model of models) {
        try {
            const response = await openai.chat.completions.create({
                model,
                temperature,
                max_tokens: maxTokens,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
            });
            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error(`AI Failover: Model ${model} failed:`, error.message);
            lastError = error;
            const retriable = [400, 404, 408, 429, 500, 502, 503, 504].includes(error.status);
            if (!retriable) break;
        }
    }

    throw new Error(`AI service error: ${lastError?.message || 'All models failed'}`);
}

export function isAIConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
}
