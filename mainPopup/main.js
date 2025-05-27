import { getStoredApiKey, storeApiKey, removeApiKey } from '../utils/utils.js';

const submitButtonAPIKey = document.querySelector("#api-key-submit");
const form = document.querySelector("#api-key-form");

async function handleSubmit(event) {
    event.preventDefault();
    const apiKey = document.querySelector("#api-key-value").value.trim();

    if (!apiKey) {
        alert("Proszę wprowadzić klucz API.");
        return;
    }

    try {
        await storeApiKey(apiKey);
        alert("Klucz API został zapisany.");
        renderViewBasedOnApiKey();
    } catch (error) {
        console.error("Błąd podczas zapisu klucza:", error);
        alert("Wystąpił błąd przy zapisie klucza API.");
    }
}

async function handleRemove() {
    await removeApiKey();
    alert("Klucz API został usunięty.");
    renderViewBasedOnApiKey();
}

function renderApiKeyForm() {
    const form = document.createElement("form");
    form.id = "api-key-form";

    const select = document.createElement("select");
    select.id = "api-key-type";

    const option = document.createElement("option");
    option.value = "GEMINI";
    option.textContent = "Gemini";
    select.appendChild(option);

    const inputKey = document.createElement("input");
    inputKey.type = "text";
    inputKey.id = "api-key-value";
    inputKey.placeholder = "Wklej klucz API...";

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.id = "api-key-submit";
    submitButton.value = "Zapisz klucz API";

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

function renderApiKeyInfo() {
    const container = document.createElement('div');
    const info = document.createElement('h1');
    const button = document.createElement('button');

    container.id = "api-key-info";
    info.innerHTML = "Klucz API jest zapisany.";
    button.innerHTML = "Usuń klucz";
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
