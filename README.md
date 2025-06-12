# ![ReplyAgent](images/logo100x100.png) ReplyAgent
## Introduction

**ReplyAgent** is a Thunderbird plugin that improves the process of replying to emails and increases message security. It is designed for users who want to respond to messages quickly and professionally, while also protecting themselves from potential threats such as spam, phishing, or anomalies in email content. It is especially useful for academic users, such as professors, who need to maintain a proper tone in communication.

## Features

- **Automatic reply generation:**

  - **Positive replies:** Agree to a request (e.g., for a consultation), following academic etiquette.
  - **Negative replies:** Politely decline a request, such as deadline extensions.
  - **Custom replies:** Allow the user to enter their own instructions for flexibility.
  - Replies are generated using appropriate polite language and encourage further communication.

- **Email safety classification:**

  - **Spam:** Detects unwanted messages like ads.
  - **Phishing:** Warns about data-stealing attempts, e.g., via suspicious links.
  - **Anomalies:** Identifies unusual elements such as future dates in headers or repeated content.
  - Classification is based on Thunderbird's built-in filter and AI analysis using a selected API provider.

- **Thunderbird integration:**

  - Displays email details (subject, sender, "Received" header).
  - Labels messages (e.g., \[SPAM\], \[PHISHING\], \[ANOMALY\]) with appropriate colors.
  - Quick replies via the "Reply" button.

## Installation

To install ReplyAgent as a temporary extension in Thunderbird, follow these steps:

1. Open Thunderbird and go to `Add-ons and Themes` > `Manage Extensions` > `Debug Add-ons`.
2. In the `Temporary Extensions` section, click `Load Temporary Add-on`.
3. Select the `manifest.json` file from the ReplyAgent plugin folder.
4. After loading, the ReplyAgent icon will appear in Thunderbird’s toolbar.
5. Configure the API key by clicking the ReplyAgent icon and following the instructions in the `mainPopup` panel.  
**Note:** An API key from the selected provider (Gemini, OpenAI, or Claude) is required for AI-based features. Enter the key in the `mainPopup` panel.

## Usage Instructions

ReplyAgent integrates with Thunderbird through three panels (popups) that make its features easy to use:

### MainPopup: API key setup

- Allows selecting the API provider (Gemini, OpenAI, Claude) and entering/managing the API key required for AI functions.
- If no key is saved, it shows a form to enter one.
- Once saved, it displays the key with an option to delete it.
- **Steps:**
  1. Click the ReplyAgent icon in the toolbar.
  2. Select the API provider and enter the key, then click `Save API Key`.
  3. Check if the key was saved or delete it if you need to change it.

### MessagePopup: Email details and quick reply

- Shows the subject, sender, and "Received" header of the selected email.
- Classifies the email for spam, phishing, and anomalies, labeling it accordingly (e.g., \[SPAM\] in orange).
- Includes a "Reply" button for quick responses.
- **Steps:**
  1. Select an email in the inbox.
  2. Click the ReplyAgent icon to open the `messagePopup`.
  3. Review the email details and safety classification.
  4. Click "Reply" to start composing a response.

### ComposePopup: Generating replies

- Provides buttons for generating positive, negative, or custom replies.
- For custom replies, a form is available to enter instructions.
- The generated reply is inserted into the compose window.
- **Steps:**
  1. Open the window for composing a new message or reply.
  2. Click the ReplyAgent icon to open the `composePopup`.
  3. Choose the reply type (positive, negative, or custom).
  4. For a custom reply, enter instructions in the form.
  5. Click the button to generate and insert the reply.

## Troubleshooting

- **Plugin doesn't load:** Make sure `manifest.json` is correctly formatted and located in the plugin folder.
- **API key issues:** Check if the key from the selected provider is valid and has the required permissions.
- **No AI response:** Ensure the API key is saved and your internet connection is working.

## FAQ

- **How to get a Gemini API key?**  
  Visit the provider’s website (Gemini, OpenAI, or Claude) and follow the instructions to obtain a key.
- **Does the plugin work without an API key?**  
  AI-based features require an API key, but Thunderbird's built-in classification works independently.

## Additional Information

- **System requirements:** Thunderbird version 128.0 or newer.
- **Future plans:** Improve AI classification and integrate with other AI platforms.
