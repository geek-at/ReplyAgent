const replyCustomButton = document.querySelector("#reply-custom-button");
const replyPolitelyButton = document.querySelector("#reply-politely-button");


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


document.getElementById("reply-politely-button").addEventListener("click", async () => {
  await generateResponse(true); // Pozytywna odpowiedź
});

document.getElementById("reply-negatively-button").addEventListener("click", async () => {
  await generateResponse(false); // Negatywna odpowiedź
});




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
  
/*
async function sendMailGenerateRequest(event) {
    const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
    let composeDetails = await messenger.compose.getComposeDetails(tab.id);
    const messageId = composeDetails.relatedMessageId;
    
    const mail = await getMailDetails(messageId);
    const subject = composeDetails.subject;
    
    const keyObj = await browser.storage.local.get("key");
    const key = keyObj.key;
    const user = await getCurrentSenderIdentity();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                "parts": [{"text": getPolitePrompt(mail, subject)}]
            }]
        })
    });
    
    const data = await response.json();
    let generatedText = formatGeminiReplyForHTML(data.candidates[0].content.parts[0].text);
    if(user.fullName != undefined) {
        generatedText = generatedText.replace('[YourName]', user.fullName);
    }
    
    await messenger.compose.setComposeDetails(tab.id, {
        body: generatedText
    });
}*/



async function generateResponse(isPositive) {
  try {
      const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
      const composeDetails = await messenger.compose.getComposeDetails(tab.id);
      const messageId = composeDetails.relatedMessageId;
      
      const mail = await getMailDetails(messageId);
      const subject = composeDetails.subject;
      const keyObj = await browser.storage.local.get("key");
      const key = keyObj.key;
      
      if (!key) {
          alert("Proszę najpierw zapisać klucz API w ustawieniach wtyczki");
          return;
      }

      const prompt = isPositive ? getPolitePrompt(mail, subject) : getNegativePrompt(mail, subject);
      
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

async function getSessionInfo() {
}

replyPolitelyButton.addEventListener(`click`, generateResponse);
replyCustomButton.addEventListener(`click`, getSessionInfo);