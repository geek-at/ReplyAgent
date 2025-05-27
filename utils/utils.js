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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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