import { getFullText, callGeminiAPI, callClaudeAPI, callOpenAIAPI, getStoredApiKey, getStoredModelType } from '../utils/utils.js';

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
        Klasyfikuj email pod kątem spamu, phishingu lub anomalii. Zwróć odpowiedź w formacie JSON z polami(przyporządkuj true jeden raz tam gdzie najlepiej pasuje):
        - spam: true/false
        - phishing: true/false
        - anomaly: true/false
        - details: tablica zwięzłych stringów (np. "Podejrzany link")

        Kontekst: Email pochodzi od studenta, więc prywatne adresy email (np. Gmail) i krótka treść są normalne.

        Dane emaila:
        - Temat: ${message.subject}
        - Nadawca: ${message.author}
        - Treść: ${messageText}
        - Nagłówek received: ${receivedHeader}

        Zasady:
        - Ignoruj znaczniki i encje HTML (np. <div>, <br>,  ) w treści – analizuj tylko czysty tekst.
        - Szukaj podejrzanych elementów, np. linków, próśb o dane osobowe, nietypowych znaków w nadawcy.
        - Podawaj powody w details maksymalnie zwięźle, np. "Link", "Dane osobowe".
        - Jeśli brak problemów, podaj w details: ["Brak nieprawidłowości"].
        `;
        let data, rawText, cleaned, classification;
        if (modelType === "GEMINI") {
            data = await callGeminiAPI(key, prompt);
            rawText = data.candidates[0].content.parts[0].text;
            cleaned = rawText.replace(/```json\n|\n```/g, '');
            classification = JSON.parse(cleaned);
        } else if (modelType === "CLAUDE") {
            data = await callClaudeAPI(key, prompt);
            // Claude: załóżmy, że odpowiedź jest w data.content[0].text
            rawText = data.content[0]?.text || '';
            cleaned = rawText.replace(/```json\n|\n```/g, '');
            classification = JSON.parse(cleaned);
        } else if (modelType === "OPENAI") {
            data = await callOpenAIAPI(key, prompt);
            // OpenAI: załóżmy, że odpowiedź jest w data.choices[0].message.content
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
    const message = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id);
    const messageId = message.id;

    document.getElementById("subject").textContent = message.subject;
    document.getElementById("from").textContent = message.author;

    const fullMessage = await messenger.messages.getFull(message.id);
    const messageText = getFullText(fullMessage);
    document.getElementById("received").textContent = fullMessage.headers.received[0];

    const thunderbirdResult = await classifyWithThunderbird(messageId);
    const aiResult = await classifyWithAI(message, fullMessage, messageText);

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
            classificationElement.textContent = "[ANOMALIA]";
            classificationElement.style.color = "purple";
        }
    }

    document.getElementById("details").textContent = classification.details.join(", ");

    document.getElementById("reply-button").addEventListener("click", async () => {
        await messenger.compose.beginReply(message.id, "replyToSender");
    });
})();
