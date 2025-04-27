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

// The user clicked our button, get the active tab in the current window using
// the tabs API.
let tabs = await messenger.tabs.query({ active: true, currentWindow: true });
let message = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id);

// Update the HTML fields with the message subject and sender.
document.getElementById("subject").textContent = message.subject;
document.getElementById("from").textContent = message.author;

let fullMessage = await messenger.messages.getFull(message.id);
let messageText = getFullText(fullMessage);
console.log(messageText);

document.getElementById("received").textContent = fullMessage.headers.received[0];

document.getElementById("reply-button").addEventListener("click", async () => {
    await messenger.compose.beginReply(message.id, "replyToSender");
});
