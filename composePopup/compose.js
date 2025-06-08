import { getFullText, formatReplyHTML, callGeminiAPI, getStoredApiKey, callClaudeAPI, callOpenAIAPI, getStoredModelType } from '../utils/utils.js';

const replyCustomButton = document.querySelector("#reply-custom-button");
const replyPolitelyButton = document.querySelector("#reply-politely-button");
const replyNegativelyButton = document.querySelector("#reply-negatively-button");

function getPolitePrompt(mailContent, subject) {
    return `
Jako profesjonalny nadawca wiadomości e-mail (np. profesor, specjalista, urzędnik, kierownik działu), przygotuj rzeczową i uprzejmą odpowiedź w tym **samym języku, w jakim otrzymano oryginalną wiadomość**.

**Nigdy nie tłumacz treści – odpowiedź ma być wyłącznie w języku źródłowym**.  
Jeśli wiadomość była po polsku – odpowiadasz po polsku.  
Jeśli po angielsku – odpowiadasz po angielsku.  
Jeśli po niemiecku – odpowiadasz po niemiecku.  
Nie stosuj tłumaczeń ani dwujęzycznych formuł.  

Temat wiadomości: "${subject}"  
Treść wiadomości: "${mailContent}"

---

###  Zasady redakcji odpowiedzi:

**1. Nagłówek (powitanie):**
   - Jeśli w treści pojawia się imię i nazwisko – rozpoznaj płeć i zastosuj odpowiednią formę powitalną:
     - *Szanowny Panie [Imię],* / *Szanowna Pani [Imię],*
     - Jeśli mniej formalnie: *Drogi [Imię],* / *Droga [Imię],*
   - Jeśli nadawcą jest zespół (np. "Project Team", "Zespół HR"):
     - użyj neutralnej formy: *Dzień dobry,* / *Hello,* / *Guten Tag,* – zgodnie z językiem oryginału
   - Jeśli brak danych – użyj ogólnego, grzecznego przywitania w języku źródłowym

**2. Treść wiadomości:**
   - Potwierdź otrzymanie maila, np.:
     - *Dziękuję za wiadomość z dnia...*
     - *Thank you for your message from...*
     - *Vielen Dank für Ihre Nachricht vom...*
   - Udziel rzeczowej, uprzejmej odpowiedzi na zadane pytanie/prośbę:
     - *Zgadzam się na...* / *I confirm that...* / *Ich stimme zu...*
   - Jeśli nie możesz udzielić pozytywnej odpowiedzi, uprzejmie odmów, bez wymyślania faktów
   - Jeśli właściwe – zachęć do dalszego kontaktu

**3. Zakończenie wiadomości:**
   - Użyj zakończenia zgodnego z językiem oryginalnym:
     - *Z wyrazami szacunku,* / *Best regards,* / *Mit freundlichen Grüßen,*
   - Podpisz się jako: [YourName]

**4. Format odpowiedzi:**
   - Czysty tekst (bez HTML)
   - Stosuj znaki nowej linii (\n) dla akapitów
   - Zachowaj profesjonalny, uprzejmy ton
   - **Nie zmieniaj języka – trzymaj się języka źródłowego**

---

###  PRZYKŁADY:

**Wiadomość po polsku:**

Temat: Prośba o zaświadczenie  
Treść:  
Dzień dobry,  
Czy mogę prosić o zaświadczenie o udziale w projekcie?

**Odpowiedź:**

Dzień dobry,

Dziękuję za wiadomość z dnia 28 maja.  
Zaświadczenie przygotuję do końca tygodnia i prześlę w formacie PDF.

Z wyrazami szacunku,  
[YourName]

---

**Wiadomość po angielsku (from a team):**

Subject: Request for project update  
Content:  
Hello,  
Could you please send us a quick update on the current status of the deliverables?

**Response:**

Hello,

Thank you for your message regarding the project update.  
All deliverables are on track and the report will be sent by Friday EOD.

Best regards,  
[YourName]

---

**Wiadomość po niemiecku:**

Betreff: Teilnahmebestätigung  
Inhalt:  
Sehr geehrter Herr [Name],  
ich benötige eine Bestätigung für meine Teilnahme am Workshop letzte Woche.

**Antwort:**

Sehr geehrter Herr [Name],

vielen Dank für Ihre Nachricht vom 27. Mai.  
Gerne sende ich Ihnen eine Teilnahmebestätigung im Laufe des Tages.

Mit freundlichen Grüßen,  
[YourName]

---

**Pamiętaj** – odpowiedź zawsze musi być w tym samym języku co wiadomość źródłowa, bez tłumaczeń.  
Zachowaj uprzejmy, profesjonalny ton i trzymaj się faktów zawartych w wiadomości.
`
}

function getNegativePrompt(mailContent, subject) {
    return `
  Jako profesjonalny nadawca wiadomości e-mail (np. profesor, specjalista, urzędnik, menedżer), przygotuj staranną, grzeczną i rzeczową odpowiedź odmowną w **tym samym języku, w jakim otrzymano oryginalną wiadomość**.
  
  **Nigdy nie tłumacz treści – odpowiedź ma być wyłącznie w języku źródłowym.**  
  Nie przechodź na inny język nawet jeśli rozumiesz wiadomość – trzymaj się dokładnie tego języka, w którym mail został napisany.
  
  Temat wiadomości: "${subject}"  
  Treść wiadomości: "${mailContent}"
  
  ---
  
  ### Zasady redakcji odpowiedzi:
  
  **1. Nagłówek (powitanie):**
     - Jeśli znane jest imię i nazwisko, rozpoznaj płeć i użyj odpowiedniej formy:
       - *Szanowny Panie [Imię],* / *Szanowna Pani [Imię],*
       - Mniej formalnie: *Drogi [Imię],* / *Droga [Imię],*
     - Jeśli nadawcą jest zespół (np. "Zespół Projektowy", "HR Team"):
       - Użyj neutralnej formy powitania zgodnej z językiem wiadomości: *Dzień dobry,*, *Hello,*, *Guten Tag,* itp.
     - Jeśli brak danych – użyj grzecznego, ogólnego przywitania
  
  **2. Treść odpowiedzi:**
     - Potwierdź otrzymanie wiadomości:
       - *Dziękuję za wiadomość z dnia...*
       - *Thank you for your message dated...*
       - *Vielen Dank für Ihre Nachricht vom...*
     - Wyraź odmowę w uprzejmy, rzeczowy sposób:
       - *Niestety, nie mogę spełnić Pani/Pana prośby...*
       - *Unfortunately, I am unable to fulfill your request...*
       - *Leider kann ich Ihrer Bitte nicht nachkommen...*
     - Możesz dodać uzasadnienie, jeśli wynika ono z treści wiadomości
     - Zaproponuj kontakt w razie dalszych pytań
  
  **3. Zakończenie:**
     - Zakończ stosowną formułą zgodnie z językiem wiadomości:
       - *Z wyrazami szacunku,* / *Best regards,* / *Mit freundlichen Grüßen,*
     - Podpisz jako: [YourName]
  
  **4. Format:**
     - Czysty tekst (bez HTML)
     - Akapity oddzielone znakami \\n
     - Styl: profesjonalny, uprzejmy, rzeczowy
     - Trzymaj się języka źródłowego – **bez tłumaczenia**
  
  ---
  
  ### PRZYKŁADY:
  
  **Polski – wiadomość od studenta:**
  
  Temat: Przedłużenie terminu  
  Treść:  
  Szanowny Panie Profesorze,  
  Czy istnieje możliwość przedłużenia terminu oddania projektu do końca czerwca?
  
  **Odpowiedź:**
  
  Szanowny Panie,
  
  Dziękuję za wiadomość z dnia 28 maja.  
  Niestety, nie mogę wyrazić zgody na przedłużenie terminu, ponieważ zgodnie z ustaleniami termin końcowy to 15 czerwca.
  
  W razie pytań proszę o kontakt.
  
  Z wyrazami szacunku,  
  [YourName]
  
  ---
  
  **Angielski – wiadomość od zespołu:**
  
  Subject: Request for deadline change  
  Content:  
  Dear Professor,  
  We would like to ask if the deadline for the report submission can be postponed by one week.
  
  **Response:**
  
  Hello,
  
  Thank you for your message regarding the deadline.  
  Unfortunately, I am unable to approve the change, as the timeline has been fixed based on earlier agreements.
  
  Please feel free to reach out if you have further questions.
  
  Best regards,  
  [YourName]
  
  ---
  
  **Niemiecki – wiadomość formalna:**
  
  Betreff: Bitte um Ausnahmeregelung  
  Inhalt:  
  Sehr geehrter Herr [Name],  
  wäre es möglich, eine Ausnahmegenehmigung für die Abgabe zu erhalten?
  
  **Antwort:**
  
  Sehr geehrter Herr [Name],
  
  vielen Dank für Ihre Nachricht vom 28. Mai.  
  Leider kann ich Ihrer Bitte nicht nachkommen, da die Abgabefrist verbindlich ist.
  
  Bei Rückfragen stehe ich Ihnen gerne zur Verfügung.
  
  Mit freundlichen Grüßen,  
  [YourName]
  
  ---
  
  **Pamiętaj** – odpowiedź musi być:
  - grzeczna, rzeczowa,
  - zawsze w języku oryginału,
  - pozbawiona domysłów,
  - zgodna z profesjonalnym standardem korespondencji.
  
  `
  }
  
  function getCustomPrompt(mailContent, subject, instructions) {
    return `
  Jako profesjonalny nadawca wiadomości e-mail (np. profesor, specjalista, urzędnik, menedżer), przygotuj staranną, uprzejmą i rzeczową odpowiedź na wiadomość o temacie: "${subject}" i treści: "${mailContent}".
  
  🗣️ **Zachowaj język oryginału**:  
  Odpowiedź musi być przygotowana **wyłącznie w tym samym języku**, w jakim została napisana wiadomość, **chyba że nadawca w ${instructions} wyraźnie poprosi o odpowiedź w innym języku**.  
  W przeciwnym razie **nigdy nie zmieniaj języka odpowiedzi**.
  
  **Przykłady wyraźnej prośby o zmianę języka** (wtedy możesz dostosować język odpowiedzi):
  - "Proszę o odpowiedź po polsku."
  - "Could you reply in English, please?"
  - "Bitte antworten Sie mir auf Deutsch."
  - "Napisz proszę odpowiedź po francusku."
  
  Jeśli nie ma takiej prośby — odpowiadaj **zawsze w języku oryginalnym wiadomości**.
  
  ---
  
  ### Zasady redakcji:
  
  **1. Nagłówek (powitanie):**
     - Jeśli w treści podano imię i nazwisko, rozpoznaj płeć i zastosuj odpowiednią formę:
       - *Szanowny Panie [Imię],* / *Szanowna Pani [Imię],*
       - Jeśli mniej formalnie: *Drogi [Imię],* / *Droga [Imię],*
     - Jeśli nadawcą jest zespół (np. "Zespół HR", "Project Team") – użyj neutralnego powitania zgodnego z językiem wiadomości: *Dzień dobry,* / *Hello,* / *Guten Tag,* itd.
  
  **2. Treść odpowiedzi:**
     - Potwierdź otrzymanie wiadomości:  
       *"Dziękuję za wiadomość z dnia..."*  
       *"Thank you for your message dated..."*  
     - Odpowiedz zgodnie z treścią, rzeczowo i grzecznie
     - Możesz wyrazić zgodę, odmowę lub przedstawić warunki, zależnie od sytuacji
     - Zachęć do dalszego kontaktu:  
       *"W razie wątpliwości proszę o kontakt..."* / *"Feel free to reach out if you have further questions..."*
  
  **3. Zakończenie:**
     - Użyj zakończenia stosownego do języka wiadomości:
       - *Z wyrazami szacunku,* / *Best regards,* / *Mit freundlichen Grüßen,* itd.
     - Podpisz się jako: [YourName]
  
  **4. Format:**
     - Czysty tekst (bez HTML)
     - Akapity oddzielane znakiem \\n
     - Zachowaj uprzejmy i profesjonalny ton
  
  **5. Dodatkowe instrukcje (priorytetowe):**
  Zastosuj poniższe instrukcje z najwyższym priorytetem przy generowaniu odpowiedzi:  
  ${instructions}
  
  ---
  
  ### Przykłady:
  
  **Mail po angielsku (bez prośby o zmianę języka):**
  
  Subject: Request for meeting  
  Content:  
  Dear Professor,  
  I would like to schedule a meeting to discuss my thesis proposal.
  
  **Odpowiedź (po angielsku):**
  
  Dear [Name],  
  Thank you for your message.  
  I confirm my availability for a meeting next week — please suggest a time that works for you.  
  Best regards,  
  [YourName]
  
  ---
  
  **Mail po angielsku (z prośbą o odpowiedź po polsku):**
  
  Subject: Request for certificate  
  Content:  
  Dear Professor,  
  Could you please send me the confirmation of attendance?  
  **Proszę o odpowiedź po polsku.**
  
  **Odpowiedź (po polsku):**
  
  Szanowny Panie,  
  Dziękuję za wiadomość z dnia 28 maja.  
  Zaświadczenie potwierdzające udział prześlę do końca tygodnia.  
  Z wyrazami szacunku,  
  [YourName]
  
  ---
  
  **Mail po niemiecku (z prośbą o odpowiedź po angielsku):**
  
  Betreff: Fristverlängerung  
  Inhalt:  
  Sehr geehrter Herr Professor,  
  ich möchte um eine Verlängerung der Abgabefrist bitten.  
  **Could you reply in English, please?**
  
  **Odpowiedź (po angielsku):**
  
  Dear [Name],  
  Thank you for your message.  
  Unfortunately, I am unable to extend the deadline, as it is fixed by program regulations.  
  Best regards,  
  [YourName]
  
  ---
  
  **Zawsze sprawdzaj język wiadomości i odpowiadaj zgodnie z nim, chyba że poproszono inaczej.**  
  Uwzględnij przekazane dodatkowe instrukcje w ${instructions} jako nadrzędne względem standardowego stylu.
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
        const modelType = await getStoredModelType();
        if (!key) {
            alert("Proszę najpierw zapisać klucz API w ustawieniach wtyczki");
            return;
        }
        let prompt = '';
        if(type === "POSITIVE") prompt = getPolitePrompt(mail, subject);
        else if(type === "NEGATIVE") prompt = getNegativePrompt(mail, subject);
        else if(type === "CUSTOM") prompt = getCustomPrompt(mail, subject, instructions);
        else throw new Error("No type provided");
        let data, generatedText;
        if (modelType === "GEMINI") {
            data = await callGeminiAPI(key, prompt);
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                alert("Błąd serwera: brak odpowiedzi");
                throw new Error("Nie udało się wygenerować odpowiedzi – brak danych od modelu.");
            }
            generatedText = formatReplyHTML(data.candidates[0].content.parts[0].text);
        } else if (modelType === "CLAUDE") {
            data = await callClaudeAPI(key, prompt);
            if (!data.content || !data.content[0]?.text) {
                alert("Błąd serwera: brak odpowiedzi");
                throw new Error("Nie udało się wygenerować odpowiedzi – brak danych od modelu.");
            }
            generatedText = formatReplyHTML(data.content[0].text);
        } else if (modelType === "OPENAI") {
            data = await callOpenAIAPI(key, prompt);
            if (!data.choices || !data.choices[0]?.message?.content) {
                alert("Błąd serwera: brak odpowiedzi");
                throw new Error("Nie udało się wygenerować odpowiedzi – brak danych od modelu.");
            }
            generatedText = formatReplyHTML(data.choices[0].message.content);
        } else {
            throw new Error("Nieobsługiwany model");
        }
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
