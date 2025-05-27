import { getFullText, formatReplyHTML, callGeminiAPI, getStoredApiKey } from '../utils/utils.js';

const replyCustomButton = document.querySelector("#reply-custom-button");
const replyPolitelyButton = document.querySelector("#reply-politely-button");
const replyNegativelyButton = document.querySelector("#reply-negatively-button");

function getPolitePrompt(mailContent, subject) {
    return`
Jako profesor odpowiadający na e-mail studenta, przygotuj staranną odpowiedź w języku polskim na wiadomość o temacie "${subject}" i treści: "${mailContent}".

Zasady redakcji:
1. Nagłówek: (w treści znajdziesz imię nazwisko więc odróżnij płeć)
   - Dla studentów bez tytułu: "Dzień dobry Panie/Pani [Imię],"
   - Dla doktorantów: "Szanowny Panie Doktorancie/Szanowna Pani Doktorantko,"
   - Dla osób z tytułem: stosuj standardowe formy grzecznościowe

2. Treść odpowiedzi:
   - Potwierdź otrzymanie wiadomości: "Dziękuję za Pański/Pani e-mail z..."
   - Wyraź zgodę w sposób merytoryczny: "Wyrażam zgodę na..."
   - Zachęcaj do kontaktu w razie pytań: "W razie wątpliwości proszę o kontakt..."
   - odpowiedź ma być rzeczowa
   - nie podawaj nieznanych ci faktów

3. Zakończenie:
   - Standardowe: "Z wyrazami szacunku,"
 [YourName]

4. Format:
   - Czysty tekst (bez HTML)
   - Znaki nowej linii (\n)
   - Akapity dla czytelności

Przykładowa struktura odpowiedzi pozytywnej:

Drogi Piotrze,

Dziękuję za Pana e-mail z prośbą o konsultację pracy dyplomowej. 
Zgadzam się spotkanie w przyszłym tygodniu. 
 
W razie dodatkowych pytań proszę o kontakt.

Z wyrazami szacunku,
[YourName]
    `
}

function getNegativePrompt(mailContent, subject) {
    return `
  Jako profesor odpowiadający na e-mail studenta, przygotuj staranną odpowiedź w języku polskim na wiadomość o temacie "${subject}" i treści: "${mailContent}".

Zasady redakcji:
1. Nagłówek: (w treści znajdziesz imię nazwisko więc odróżnij płeć)
   - Dla studentów bez tytułu: "Dzień dobry Panie/Pani [Imię],"
   - Dla doktorantów: "Szanowny Panie Doktorancie/Szanowna Pani Doktorantko,"
   - Dla osób z tytułem: stosuj standardowe formy grzecznościowe

2. Treść odpowiedzi:
   - Potwierdź otrzymanie wiadomości: "Dziękuję za Pański/Pani e-mail z..."
   - Wyraźne oznaczenie odmowy: "Niestety, nie mogę spełnić Pani/Pana prośby"
   - Zachęcaj do kontaktu w razie pytań: "W razie wątpliwości proszę o kontakt..."
   - odpowiedź ma być rzeczowa
   - nie podawaj nieznanych ci faktów

3. Zakończenie:
   - Standardowe: "Z wyrazami szacunku,"
  [YourName]

4. Format:
   - Czysty tekst (bez HTML)
   - Znaki nowej linii (\n)
   - Akapity dla czytelności

Przykładowa struktura odpowiedzi negatywnej:

Diękuję za wiadomość z prośbą o przedłużenie terminu oddania pracy zaliczeniowej do 30 czerwca. 
Niestety, nie mogę wyrazić na to zgody, ponieważ regulamin studiów wyraźnie określa ostateczny termin na 15 czerwca.

Z wyrazami szacunku,
[YourName]
`
}

function getCustomPrompt(mailContent, subject, instructions) {
    return `
  Jako profesor odpowiadający na e-mail studenta, przygotuj staranną odpowiedź w języku polskim na wiadomość o temacie "${subject}" i treści: "${mailContent}".

Zasady redakcji:
1. Nagłówek: (w treści znajdziesz imię nazwisko więc odróżnij płeć)
   - Dla studentów bez tytułu: "Dzień dobry Panie/Pani [Imię],"
   - Dla doktorantów: "Szanowny Panie Doktorancie/Szanowna Pani Doktorantko,"
   - Dla osób z tytułem: stosuj standardowe formy grzecznościowe

2. Treść odpowiedzi:
   - Potwierdź otrzymanie wiadomości: "Dziękuję za Pański/Pani e-mail z..."
   - Wyraźne oznaczenie odmowy: "Niestety, nie mogę spełnić Pani/Pana prośby"
   - Zachęcaj do kontaktu w razie pytań: "W razie wątpliwości proszę o kontakt..."
   - odpowiedź ma być rzeczowa
   - nie podawaj nieznanych ci faktów

3. Zakończenie:
   - Standardowe: "Z wyrazami szacunku,"
  [YourName]

4. Format:
   - Czysty tekst (bez HTML)
   - Znaki nowej linii (\n)
   - Akapity dla czytelności
5. Dodatkowe instrukcje:
Dodatkowo uwzględnij priorytetowo instrukcje podane tutaj: ${instructions}
  `
}

async function getCurrentSenderIdentity() {
    const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });

    if (!tab || tab.type !== "messageCompose") {
        console.error("Not inside a compose window.");
        return null;
    }

    const composeDetails = await messenger.compose.getComposeDetails(tab.id);

    if (!composeDetails.identityId) {
        console.error("No identity found in compose details.");
        return null;
    }

    const identity = await messenger.identities.get(composeDetails.identityId);

    return {
        fullName: identity.fullName,
        email: identity.email
    };
}

async function getMailDetails(messageId) {
    if (messageId) {
        const fullMessage = await messenger.messages.getFull(messageId);
        return getFullText(fullMessage);
    } else {
        alert("Error! No related message ID.");
    }
}

async function generateResponse(type, instructions = "") {
    try {
        const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
        const composeDetails = await messenger.compose.getComposeDetails(tab.id);
        const messageId = composeDetails.relatedMessageId;

        const mail = await getMailDetails(messageId);
        const subject = composeDetails.subject;
        const key = await getStoredApiKey();

        if (!key) {
            alert("Proszę najpierw zapisać klucz API w ustawieniach wtyczki");
            return;
        }

        let prompt = '';
        if(type === "POSITIVE") prompt = getPolitePrompt(mail, subject);
        else if(type === "NEGATIVE") prompt = getNegativePrompt(mail, subject);
        else if(type === "CUSTOM") prompt = getCustomPrompt(mail, subject, instructions);
        else throw new Error("No type provided");

        const data = await callGeminiAPI(key, prompt);

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            alert("Błąd serwera: brak odpowiedzi");
            throw new Error("Nie udało się wygenerować odpowiedzi – brak danych od modelu.");
        }

        let generatedText = formatReplyHTML(data.candidates[0].content.parts[0].text);
        const user = await getCurrentSenderIdentity();
        if (user.fullName) generatedText = generatedText.replace('[YourName]', user.fullName);

        await messenger.compose.setComposeDetails(tab.id, {
            body: generatedText
        });
        alert("Odpowiedź została wygenerowana i wklejona do treści wiadomości.");
    } catch (error) {
        console.error("Błąd generowania odpowiedzi:", error);
        alert("Wystąpił błąd: " + error.message);
    }
}

function toggleCustomForm() {
    const form = document.querySelector("#custom-prompt-form");

    const existingInput = document.querySelector('#custom-prompt-input');
    if (existingInput) {
        removeCustomForm();
        return;
    }

    replyCustomButton.disabled = true;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Wprowadź konkretne instrukcje...';
    input.id = 'custom-prompt-input';
    input.required = true;

    const button = document.createElement('button');
    button.id = 'custom-prompt-button';
    button.textContent = 'Wyślij';

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const instructions = input.value.trim();
        if (!instructions) {
            alert("Proszę wprowadzić instrukcje.");
            return;
        }
        await generateResponse("CUSTOM", instructions);
    });

    form.appendChild(input);
    form.appendChild(button);
}

function removeCustomForm() {
    replyCustomButton.disabled = false;
    const input = document.querySelector('#custom-prompt-input');
    const button = document.querySelector('#custom-prompt-button');

    if (input) input.remove();
    if (button) button.remove();
}

replyCustomButton.addEventListener("click", toggleCustomForm);
replyPolitelyButton.addEventListener("click", async () => {
    await generateResponse("POSITIVE");
});
replyNegativelyButton.addEventListener("click", async () => {
    await generateResponse("NEGATIVE");
});
