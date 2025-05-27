const replyCustomButton = document.querySelector("#reply-custom-button");
const promptCustomButton = document.querySelector("#custom-prompt-button");
const replyPolitelyButton = document.querySelector("#reply-politely-button");
const replyNegativelyButton = document.querySelector("#reply-negatively-button");

function getPolitePrompt(mailContent, subject) {
    return`

Jako profesor odpowiadający na e-mail studenta, przygotuj staranną odpowiedź w języku polskim na wiadomość o temacie "${subject}" i treści: "${mailContent}".

Zasady redakcji:
1. Nagłówek: (w treści znajdziesz imię nazwisko więc odróżnij płeć)
   - Dla studentów bez tytułu: "Drogi/Droga [Imię]," (jeśli znamy imię) lub "Dzień dobry,"
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
   - Dla studentów bez tytułu: "Drogi/Droga [Imię]," (jeśli znamy imię) lub "Dzień dobry,"
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

Przykładowa struktura odpowiedzi pozytywnej:

Diękuję za wiadomość z prośbą o przedłużenie terminu oddania pracy zaliczeniowej do 30 czerwca. 
Niestety, nie mogę wyrazić na to zgody, ponieważ regulamin studiów wyraźnie określa ostateczny termin na 15 czerwca.


Z wyrazami szacunku,
[YourName]
`
}

function getCustomPrompt(mailContent, subject, instructions) {
  return `
    Odpowiedz na wiadomość o temacie ${subject} oraz treści ${mailContent} uwzględniając tylko instrukcje podane tutaj : ${instructions}
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
  
    console.log("Current user fullName:", identity.fullName);
    console.log("Current user email:", identity.email);
  
    return {
      fullName: identity.fullName,
      email: identity.email
    };
  }


function getFullText(fullMessage) {
    let messageBody = "";
    if(fullMessage.parts) {
      for(let part of fullMessage.parts) {
        for(let subpart of part.parts) {
            messageBody += subpart.body;
        }
      }
    }
    return messageBody;
  };
  

async function getMailDetails(messageId) {
    if (messageId) {
        const fullMessage = await messenger.messages.getFull(messageId);
        console.log(fullMessage)
        return getFullText(fullMessage);
    } else {
        alert("Error! No related message ID.");
    }
}

function formatGeminiReplyForHTML(text) {
    if (!text || typeof text !== "string") {
      return "(No polite reply generated)";
    }
    text = text.trim();
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/\n{2,}/g, '\n\n');
    text = text.split('\n').map(line => line.trimEnd()).join('\n');
  
    text = text.replace(/\n/g, '<br>');
  
    return text;
  }



async function generateResponse(type, instructions = "") {
  try {
      console.log(type);
      const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
      const composeDetails = await messenger.compose.getComposeDetails(tab.id);
      const messageId = composeDetails.relatedMessageId;
      
      const mail = await getMailDetails(messageId);
      const subject = composeDetails.subject;
      const keyObj = await browser.storage.local.get("key");
      const key = keyObj.key;
      console.log(mail);
      if (!key) {
          alert("Proszę najpierw zapisać klucz API w ustawieniach wtyczki");
          return;
      }

      let prompt = '';
      if(type == "POSITIVE") {
        prompt = getPolitePrompt(mail, subject);
      }
      else if(type == "NEGATIVE") {
        prompt = getNegativePrompt(mail, subject);
      }
      else if(type == "CUSTOM") {
        prompt = getCustomPrompt(mail, subject, instructions);
      }
      else {
        throw new Error("No type provided");
        
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              contents: [{
                  "parts": [{"text": prompt}]
              }]
          })
      });

      const data = await response.json();
      let generatedText = formatGeminiReplyForHTML(data.candidates[0].content.parts[0].text);
      const user = await getCurrentSenderIdentity();
      if (user.fullName) {
          generatedText = generatedText.replace('[YourName]', user.fullName);
      }
      
      await messenger.compose.setComposeDetails(tab.id, {
          body: generatedText
      });
  } catch (error) {
      console.error("Błąd generowania odpowiedzi:", error);
      alert("Wystąpił błąd: " + error.message);
  }
}

function generateCustomForm() {
  replyCustomButton.disabled = true;
  const form = document.querySelector("#custom-prompt-form");
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Wprowadź konkretne instrukcje...';
  input.id = 'custom-prompt-input';
  input.required = true;

  const button = document.createElement('button');
  button.id = 'custom-prompt-button';
  button.textContent = 'Wyślij';
  form.appendChild(input);
  form.appendChild(button);
  
  document.querySelector("#custom-prompt-button").addEventListener('click', async () => {
    await generateResponse("CUSTOM", input.value);
  });
}

function removeCustomForm() {
  replyCustomButton.disabled = false;
  const input = document.querySelector('#custom-prompt-input');
  const button = document.querySelector('#custom-prompt-button');

  if (input) input.remove();
  if (button) button.remove();

}
replyCustomButton.addEventListener(`click`, generateCustomForm);
replyPolitelyButton.addEventListener("click", async () => {
  await generateResponse("POSITIVE");
});
replyNegativelyButton.addEventListener("click", async () => {
  await generateResponse("NEGATIVE");
});

