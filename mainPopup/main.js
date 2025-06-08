import { getStoredApiKey, storeApiKey, removeApiKey } from '../utils/utils.js';

const submitButtonAPIKey = document.querySelector("#api-key-submit");
const form = document.querySelector("#api-key-form");

async function handleSubmit(event) {
    event.preventDefault();
    const apiKey = document.querySelector("#api-key-value").value.trim();

    if (!apiKey) {
        alert("Please enter API key.");
        return;
    }

    try {
        await storeApiKey(apiKey);
        alert("API key was saved.");
        renderViewBasedOnApiKey();
    } catch (error) {
        console.error("Error while saving API key:", error);
        alert("Error while saving API key.");
    }
}

async function handleRemove() {
    await removeApiKey();
    await browser.storage.local.remove('modelType');
    alert("API key was removed.");
    renderViewBasedOnApiKey();
}

function renderApiKeyForm() {
    const form = document.createElement("form");
    form.id = "api-key-form";

    const select = document.createElement("select");
    select.id = "api-key-type";

    const optionGemini = document.createElement("option");
    optionGemini.value = "GEMINI";
    optionGemini.textContent = "Gemini";
    select.appendChild(optionGemini);

    const optionClaude = document.createElement("option");
    optionClaude.value = "CLAUDE";
    optionClaude.textContent = "Claude";
    select.appendChild(optionClaude);

    const optionOpenAI = document.createElement("option");
    optionOpenAI.value = "OPENAI";
    optionOpenAI.textContent = "OpenAI";
    select.appendChild(optionOpenAI);

    select.addEventListener('change', async (event) => {
        await browser.storage.local.set({ modelType: event.target.value });
    });

    const inputKey = document.createElement("input");
    inputKey.type = "text";
    inputKey.id = "api-key-value";
    inputKey.placeholder = "Paste your API key here...";

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.id = "api-key-submit";
    submitButton.value = "Save API key";

    form.appendChild(select);
    form.appendChild(inputKey);
    form.appendChild(submitButton);
    document.body.appendChild(form);
    form.addEventListener("submit", handleSubmit);
}

function removeApiKeyForm() {
    const form = document.querySelector('#api-key-form');
    if (form) {
        document.body.removeChild(form);
    }
}

async function renderApiKeyInfo() {
    const container = document.createElement('div');
    const info = document.createElement('h1');
    const modelInfo = document.createElement('p');
    const button = document.createElement('button');

    container.id = "api-key-info";
    info.innerHTML = "API key is saved.";

    const { modelType } = await browser.storage.local.get("modelType");
    modelInfo.innerHTML = "Model provider: " + (modelType);

    button.innerHTML = "Remove API key";
    container.appendChild(info);
    container.appendChild(modelInfo);
    container.appendChild(button);
    document.body.appendChild(container);
    button.addEventListener("click", handleRemove);
}

function removeApiKeyInfo() {
    const container = document.querySelector('#api-key-info');
    if (container) {
        document.body.removeChild(container);
    }
}

async function renderViewBasedOnApiKey() {
    const key = await getStoredApiKey();
    if (key) {
        removeApiKeyForm();
        renderApiKeyInfo();
    } else {
        removeApiKeyInfo();
        renderApiKeyForm();
    }
}

document.addEventListener('DOMContentLoaded', renderViewBasedOnApiKey);

async function handleModelSelection(event) {
    event.preventDefault();
    const select = document.querySelector("#api-key-type");
    await browser.storage.local.set({ modelType: select.value });
    alert("Model was saved.");
    renderViewBasedOnApiKey();
}
