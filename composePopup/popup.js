const replyCustomButton = document.querySelector("#reply-custom-button");
const replyPolitelyButton = document.querySelector("#reply-politely-button");


function getPolitePrompt(mailContent, subject) {
    return`
    Napisz bardzo uprzejmą odpowiedź po polsku na poniższy e-mail o treści ${mailContent} i temacie ${subject} 
    
    - Jeżeli nadawca nie ma żadnych tytułów, zacznij od "Dzień dobry," w osobnym wierszu.
    - Jeżeli nadawca ma tytuły naukowe określ je w sposób:
        - Szanowny Pani Doktor/Szanowny Panie Doktorze, jeżeli ma tytuł doktora,
        - Szanowna Pani Profesor/Szanowny Panie Profesorze, jeżeli ma tytuł profesora lub doktora habilitowanego,
        - Szanowna Pani/ Szanowny Panie, dla każdego innego.
    - Na końcu dodaj podpis "Z poważaniem," i "[YourName]" w osobnych liniach.
    - Używaj zwykłych znaków nowej linii \\n, bez HTML, bez formatowania.
    
    Tekst powinien wyglądać jak naturalny e-mail, czysto tekstowy.
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
}

async function getSessionInfo() {
}

replyPolitelyButton.addEventListener(`click`, sendMailGenerateRequest);
replyCustomButton.addEventListener(`click`, getSessionInfo);