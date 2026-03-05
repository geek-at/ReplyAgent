export function getFullText(fullMessage) {
    let messageBody = "";
    function collectBodies(parts) {
        for (let part of parts) {
            if (part.body) messageBody += part.body;
            if (part.parts) collectBodies(part.parts);
        }
    }
    if (fullMessage.parts) collectBodies(fullMessage.parts);
    if (fullMessage.body) messageBody += fullMessage.body;
    return messageBody;
}

export function formatReplyHTML(text) {
    if (!text || typeof text !== "string") return "(No reply generated)";
    text = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/\n{2,}/g, '\n\n');
    text = text.split('\n').map(line => line.trimEnd()).join('\n');
    return text.replace(/\n/g, '<br>');
}

export async function callGeminiAPI(key, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data;
}
export async function callClaudeAPI(key, prompt) {
    const response = await fetch(`https://api.anthropic.com/v1/messages`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            messages: [{ role: "user", content: prompt }]
        })
    });
    const data = await response.json();
    return data;
}

export async function callOpenAIAPI(key, prompt) {
    const endpoint = await getStoredOpenAIEndpoint();
    const model = await getStoredOpenAIModel();
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }]
        })
    });
    const data = await response.json();
    return data;
}

export async function getStoredApiKey() {
    const { key } = await browser.storage.local.get("key");
    return key;
}

export async function storeApiKey(key) {
    await browser.storage.local.set({ key });
}

export async function removeApiKey() {
    await browser.storage.local.remove('key');
}

export async function getStoredModelType() {
    const { modelType } = await browser.storage.local.get("modelType");
    return modelType || "GEMINI";
}

const DEFAULT_OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_OPENAI_MODEL = 'gpt-5-mini-2025-08-07';

export async function getStoredOpenAIEndpoint() {
    const { openaiEndpoint } = await browser.storage.local.get("openaiEndpoint");
    return openaiEndpoint || DEFAULT_OPENAI_ENDPOINT;
}

export async function storeOpenAIEndpoint(endpoint) {
    await browser.storage.local.set({ openaiEndpoint: endpoint });
}

export async function getStoredOpenAIModel() {
    const { openaiModel } = await browser.storage.local.get("openaiModel");
    return openaiModel || DEFAULT_OPENAI_MODEL;
}

export async function storeOpenAIModel(model) {
    await browser.storage.local.set({ openaiModel: model });
}