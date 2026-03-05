import { getStoredApiKey, storeApiKey, removeApiKey, getStoredOpenAIEndpoint, storeOpenAIEndpoint, getStoredOpenAIModel, storeOpenAIModel } from '../utils/utils.js';

const submitButtonAPIKey = document.querySelector("#api-key-submit");
const form = document.querySelector("#api-key-form");

async function handleSubmit(event) {
    event.preventDefault();
    const apiKey = document.querySelector("#api-key-value").value.trim();

    if (!apiKey) {
        alert(browser.i18n.getMessage("please_enter_api_key"));
        return;
    }

    try {
        await storeApiKey(apiKey);

        const endpointInput = document.querySelector("#openai-endpoint");
        const modelInput = document.querySelector("#openai-model");
        if (endpointInput) await storeOpenAIEndpoint(endpointInput.value.trim());
        if (modelInput) await storeOpenAIModel(modelInput.value.trim());

        alert(browser.i18n.getMessage("api_key_saved"));
        renderViewBasedOnApiKey();
    } catch (error) {
        console.error("Error while saving API key:", error);
        alert(browser.i18n.getMessage("error_saving_api_key"));
    }
}

async function handleRemove() {
    await removeApiKey();
    await browser.storage.local.remove(['modelType', 'openaiEndpoint', 'openaiModel']);
    alert(browser.i18n.getMessage("api_key_removed"));
    renderViewBasedOnApiKey();
}

function renderApiKeyForm() {
    const form = document.createElement("form");
    form.id = "api-key-form";

    const select = document.createElement("select");
    select.id = "api-key-type";

    const optionGemini = document.createElement("option");
    optionGemini.value = "GEMINI";
    optionGemini.textContent = browser.i18n.getMessage("gemini");
    select.appendChild(optionGemini);

    const optionClaude = document.createElement("option");
    optionClaude.value = "CLAUDE";
    optionClaude.textContent = browser.i18n.getMessage("claude");
    select.appendChild(optionClaude);

    const optionOpenAI = document.createElement("option");
    optionOpenAI.value = "OPENAI";
    optionOpenAI.textContent = browser.i18n.getMessage("openai");
    select.appendChild(optionOpenAI);

    // OpenAI-specific fields container
    const openaiFields = document.createElement("div");
    openaiFields.id = "openai-fields";
    openaiFields.style.display = "none";

    const endpointInput = document.createElement("input");
    endpointInput.type = "text";
    endpointInput.id = "openai-endpoint";
    endpointInput.placeholder = browser.i18n.getMessage("openai_endpoint_placeholder");

    const modelInput = document.createElement("input");
    modelInput.type = "text";
    modelInput.id = "openai-model";
    modelInput.placeholder = browser.i18n.getMessage("openai_model_placeholder");

    openaiFields.appendChild(endpointInput);
    openaiFields.appendChild(modelInput);

    function toggleOpenAIFields(value) {
        openaiFields.style.display = value === "OPENAI" ? "block" : "none";
    }

    select.addEventListener('change', async (event) => {
        await browser.storage.local.set({ modelType: event.target.value });
        toggleOpenAIFields(event.target.value);
    });

    // Pre-fill stored values
    (async () => {
        const { modelType } = await browser.storage.local.get("modelType");
        if (modelType) select.value = modelType;
        toggleOpenAIFields(select.value);
        const endpoint = await getStoredOpenAIEndpoint();
        const model = await getStoredOpenAIModel();
        endpointInput.value = endpoint;
        modelInput.value = model;
    })();

    const inputKey = document.createElement("input");
    inputKey.type = "text";
    inputKey.id = "api-key-value";
    inputKey.placeholder = browser.i18n.getMessage("paste_api_key_here");

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.id = "api-key-submit";
    submitButton.value = browser.i18n.getMessage("save_api_key");

    form.appendChild(select);
    form.appendChild(openaiFields);
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
    const button = document.createElement('button');

    container.id = "api-key-info";
    info.textContent = browser.i18n.getMessage("api_key_is_saved");

    button.textContent = browser.i18n.getMessage("remove_api_key");
    container.appendChild(info);
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
    alert(browser.i18n.getMessage("model_saved"));
    renderViewBasedOnApiKey();
}