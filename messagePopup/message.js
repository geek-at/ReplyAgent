import { getFullText, callGeminiAPI, callClaudeAPI, callOpenAIAPI, getStoredApiKey, getStoredModelType } from '../utils/utils.js';

let message, fullMessage, messageText;
const classificationEl = document.getElementById('classification');
const detailsEl = document.getElementById('details');
const summaryResultEl = document.getElementById('summary-result');
const translateResultEl = document.getElementById('translate-result');
if (classificationEl) classificationEl.style.display = 'none';
if (detailsEl) detailsEl.style.display = 'none';
if (summaryResultEl) summaryResultEl.style.display = 'none';
if (translateResultEl) translateResultEl.style.display = 'none';

const cacheKeyClassification = (id) => `ra_cache_classification_${id}`;
const cacheKeySummary = (id) => `ra_cache_summary_${id}`;
const cacheKeyTranslate = (id, lang) => `ra_cache_translate_${id}_${lang}`;

async function cacheGet(key) {
    try {
        const area = (browser.storage && browser.storage.session) ? browser.storage.session : browser.storage.local;
        const obj = await area.get(key);
        return obj?.[key];
    } catch (_) { return undefined; }
}

async function cacheSet(key, value) {
    try {
        const area = (browser.storage && browser.storage.session) ? browser.storage.session : browser.storage.local;
        await area.set({ [key]: value });
    } catch (_) { /* ignore */ }
}

function getUiLanguageCode() {
    try {
        if (typeof browser !== 'undefined' && browser.i18n && typeof browser.i18n.getUILanguage === 'function') {
            const ui = browser.i18n.getUILanguage();
            if (ui) return ui.toLowerCase();
        }
    } catch (e) {}
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language.toLowerCase();
    return 'en';
}

function mapLangCodeToEnglishName(code) {
    const base = (code || 'en').split('-')[0];
    switch (base) {
        case 'pl': return { base, name: 'Polish' };
        case 'de': return { base, name: 'German' };
        case 'es': return { base, name: 'Spanish' };
        case 'fr': return { base, name: 'French' };
        case 'ja': return { base, name: 'Japanese' };
        case 'it': return { base, name: 'Italian' };
        case 'en': default: return { base: 'en', name: 'English' };
    }
}

function classifyWithThunderbird(messageId) {
    return messenger.messages.get(messageId)
        .then(messageDetails => {
            const isJunk = messageDetails.junk || false;
            return { spam: isJunk, details: isJunk ? ["Zaznaczony jako spam"] : [] };
        })
        .catch(error => {
            console.error("classifyWithThunderbird: Błąd", error);
            return { spam: false, details: [] };
        });
}

async function classifyWithAI(message, fullMessage, messageText) {
    try {
        const key = await getStoredApiKey();
        if (!key) throw new Error("Brak klucza API.");
        const modelType = await getStoredModelType();
        const receivedHeader = fullMessage.headers?.received?.[0] || "";
        const prompt = `
        Classify the email for spam, phishing, or anomaly. Return ONLY raw JSON with the fields:
        - spam: true/false
        - phishing: true/false
        - anomaly: true/false
        - details: array of short English reasons (e.g., "Suspicious link")

        Context: The message can be from a student; private email domains (e.g., Gmail) and short content may be normal.

        Email data:
        - Subject: ${message.subject}
        - From: ${message.author}
        - Body: ${messageText}
        - Received header: ${receivedHeader}

        Rules:
        - Set exactly ONE of spam/phishing/anomaly to true (pick the best fit). Set the other two to false. If nothing applies, set all to false.
        - Ignore HTML tags and entities (e.g., <div>, <br>); analyze plain text only.
        - Keep reasons in details very concise, 1–3 words each, like "Link", "Credentials request".
        - If there are no issues, use details: ["No issues"].
        `;
        let data, rawText, cleaned, classification;
        if (modelType === "GEMINI") {
            data = await callGeminiAPI(key, prompt);
            rawText = data.candidates[0].content.parts[0].text;
            cleaned = rawText.replace(/```json\n|\n```/g, '');
            classification = JSON.parse(cleaned);
        } else if (modelType === "CLAUDE") {
            data = await callClaudeAPI(key, prompt);
            rawText = data.content[0]?.text || '';
            cleaned = rawText.replace(/```json\n|\n```/g, '');
            classification = JSON.parse(cleaned);
        } else if (modelType === "OPENAI") {
            data = await callOpenAIAPI(key, prompt);
            rawText = data.choices[0]?.message?.content || '';
            cleaned = rawText.replace(/```json\n|\n```/g, '');
            classification = JSON.parse(cleaned);
        } else {
            throw new Error("Nieobsługiwany model");
        }
        if (!classification.details?.length || (!classification.spam && !classification.phishing && !classification.anomaly)) {
            classification.details = ["Brak nieprawidłowości"];
        }
        console.log("classifyWithAI: Wynik", classification);
        return classification;
    } catch (error) {
        console.error("classifyWithAI: Błąd", error);
        return { spam: false, phishing: false, anomaly: false, details: ["Błąd AI"] };
    }
}

(async () => {
    const tabs = await messenger.tabs.query({ active: true, currentWindow: true });
    message = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id);
    const messageId = message.id;

    document.getElementById("subject").textContent = message.subject;
    document.getElementById("from").textContent = message.author;

    fullMessage = await messenger.messages.getFull(message.id);
    messageText = getFullText(fullMessage);
    document.getElementById("received").textContent = fullMessage.headers.received[0];

    const thunderbirdResult = await classifyWithThunderbird(messageId);
    // Load cached AI classification if available; otherwise compute and cache
    let aiResult = await cacheGet(cacheKeyClassification(messageId));
    if (!aiResult) {
        aiResult = await classifyWithAI(message, fullMessage, messageText);
        cacheSet(cacheKeyClassification(messageId), aiResult);
    }

    const classification = {
        spam: thunderbirdResult.spam || aiResult.spam,
        phishing: aiResult.phishing || false,
        anomaly: aiResult.anomaly || false,
        details: [...thunderbirdResult.details, ...aiResult.details]
    };

    const classificationElement = document.getElementById("classification");
    if (classificationElement) {
        classificationElement.textContent = "";
        if (classification.spam) {
            classificationElement.textContent = "[SPAM]";
            classificationElement.style.color = "orange";
        }
        if (classification.phishing) {
            classificationElement.textContent = "[PHISHING]";
            classificationElement.style.color = "red";
        }
        if (classification.anomaly) {
            classificationElement.textContent = "[ANOMALY]";
            classificationElement.style.color = "purple";
        }
        if (classificationElement.textContent) classificationElement.style.display = 'inline';
    }

    const detailsContainer = document.getElementById("details");
    if (detailsContainer) {
        detailsContainer.textContent = classification.details.join(", ");
        detailsContainer.style.display = 'block';
    }

    try {
        const cachedSummary = await cacheGet(cacheKeySummary(message.id));
        if (cachedSummary) {
            const container = document.getElementById('summary-result');
            if (container) {
                container.textContent = cachedSummary;
                container.style.display = 'block';
            }
        }
    } catch (_) {}

    try {
        const target = mapLangCodeToEnglishName(getUiLanguageCode());
        const tKey = cacheKeyTranslate(message.id, target.base);
        const cachedTranslation = await cacheGet(tKey);
        if (cachedTranslation) {
            const tContainer = document.getElementById('translate-result');
            if (tContainer) {
                tContainer.textContent = cachedTranslation;
                tContainer.style.display = 'block';
            }
        }
    } catch (_) {}

    document.getElementById("reply-button").addEventListener("click", async () => {
        await messenger.compose.beginReply(message.id, "replyToSender");
    });
})();

async function summaryWithAI(message, fullMessage, messageText) {
    try {
        const key = await getStoredApiKey();
        if (!key) throw new Error ("Brak klucza API.");
        const modelType = await getStoredModelType();
        const receivedHeader = fullMessage.headers?.received?.[0] || ""; 
        const prompt = `
        Jesteś asystentem, który streszcza CAŁĄ treść e‑maila. Wykryj automatycznie język wiadomości i zwróć wynik WYŁĄCZNIE w tym samym języku (bez tłumaczenia). Ten wymóg ma NAJWYŻSZY priorytet.

        Zasady ogólne:
        - Streszczenie musi być w tym samym języku co wiadomość. Nigdy nie tłumacz. Przykłady: polski→polski, English→English, Deutsch→Deutsch.
        - Zachowaj zwięzłość i klarowność. Zero dygresji i grzeczności niezwiązanych z meritum.
        - Nie dodawaj informacji, których nie ma w mailu. Nie spekuluj.
        - Jeśli czegoś brakuje lub jest niejednoznaczne, wskaż to w sekcji „Uwagi/ryzyka”.
        - Używaj prostych zdań. Czysty tekst (bez markdown). Listy wypunktowane twórz z myślnikami („- ”).
        - Jeżeli są daty, terminy, linki lub załączniki – wyodrębnij je.
        - Pierwsze 1–2 zdania mają stanowić esencję (lead), aby nadawały się do podglądu/preview w skrzynce odbiorczej.

        Dane emaila:
        - Temat: ${message.subject}
        - Nadawca: ${message.author}
        - Treść: ${messageText}
        - Nagłówek received: ${receivedHeader}

        Format wyjścia (nazwy sekcji w języku maila):
        Streszczenie 
        Kluczowe informacje:
        - …
        - …
        Działania do podjęcia:
        - …
        - …
        Uwagi/ryzyka:
        - …
        Załączniki i linki:
        - …

        Limity: **Maks. 120–180 słów łącznie. Zwracaj tylko tekst wynikowy, bez dodatkowych instrukcji.**
        `;
        let data, summary;
        if (modelType === "GEMINI") {
            data = await callGeminiAPI(key, prompt);
            summary = data.candidates[0].content.parts[0].text;
        } else if (modelType === "CLAUDE") {
            data = await callClaudeAPI(key, prompt);
            summary = data.content[0]?.text || '';
        } else if (modelType === "OPENAI") {
            data = await callOpenAIAPI(key, prompt);
            summary = data.choices[0]?.message?.content || '';
        } else {
            throw new Error("Nieobsługiwany model");
        }
        return summary;
    } catch (error) {
        console.error("summaryWithAI: Błąd", error);
        return "Błąd podczas generowania podsumowania.";
    }
}

    document.getElementById("summary-button").addEventListener("click", async () => {
    let summary = await cacheGet(cacheKeySummary(message.id));
    if (!summary) {
        summary = await summaryWithAI(message, fullMessage, messageText);
        cacheSet(cacheKeySummary(message.id), summary);
    }
    const container = document.getElementById("summary-result");
    if (container) {
        container.textContent = summary;
        container.style.display = 'block';
    }
});

async function translateWithAI(message, fullMessage, messageText) {
    try {
        const key = await getStoredApiKey();
        if (!key) throw new Error ("Brak klucza API.");
        const modelType = await getStoredModelType();
        const receivedHeader = fullMessage.headers?.received?.[0] || ""; 
        const uiLang = getUiLanguageCode();
        const target = mapLangCodeToEnglishName(uiLang); 
        const prompt = `
        Jesteś profesjonalnym tłumaczem e‑maili. Wykryj automatycznie język oryginału i przetłumacz CAŁĄ treść na ${target.name} (kod: ${target.base}).

        Wymagania:
        - Zwróć WYŁĄCZNIE czysty tekst tłumaczenia (bez znaczników HTML i bez markdown).
        - Nie używaj gwiazdek ani podkreśleń do formatowania (nie twórz *nagłówków*, **pogrubień**, _kursywy_ itd.).
        - Zachowaj możliwie zbliżony układ: nowe linie, numerację, odstępy między sekcjami.
        - Listy wypunktowane zapisuj myślnikami: "- " (nie używaj "* ").
        - Linki pozostaw w oryginale, ale tłumacz otaczający tekst.
        - Nie tłumacz nazw własnych, adresów e‑mail i wartości technicznych.
        - Jeśli w treści są ostrzeżenia lub nietypowe znaki, przetłumacz je dosłownie.

        Dane pomocnicze (tylko kontekst – NIE powtarzaj w wyniku):
        - Temat: ${message.subject}
        - Nadawca: ${message.author}
        - Nagłówek Received: ${receivedHeader}

        Treść do tłumaczenia (może zawierać HTML – analizuj jako tekst i zachowuj podział linii): ${messageText}
        `;
        
        let data, translate;
        if (modelType === "GEMINI") {
            data = await callGeminiAPI(key, prompt);
            translate = data.candidates[0].content.parts[0].text;
        } else if (modelType === "CLAUDE") {
            data = await callClaudeAPI(key, prompt);
            translate = data.content[0]?.text || '';
        } else if (modelType === "OPENAI") {
            data = await callOpenAIAPI(key, prompt);
            translate = data.choices[0]?.message?.content || '';
        } else {
            throw new Error("Nieobsługiwany model");
        }
        return translate;
    } catch (error) {
        console.error("translateWithAI: Error", error);
        return "Error during translation generation.";
    }
}

document.getElementById("translate-button").addEventListener("click", async () => {
    const target = mapLangCodeToEnglishName(getUiLanguageCode());
    const tKey = cacheKeyTranslate(message.id, target.base);
    let translate = await cacheGet(tKey);
    if (!translate) {
        translate = await translateWithAI(message, fullMessage, messageText);
        cacheSet(tKey, translate);
    }
    const container = document.getElementById("translate-result");
    if (container) {
        container.textContent = translate;
        container.style.display = 'block';
    }
});