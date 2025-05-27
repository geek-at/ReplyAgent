const submitButtonAPIKey = document.querySelector("#api-key-submit");
const form = document.querySelector("#api-key-form");

async function handleSubmit() {
    let apiKey = document.querySelector("#api-key-value").value.trim();
    if(apiKey == "") {
        throw new Error("Should not be empty.");
    }
    else {
        try {
            await browser.storage.local.set({ key: apiKey });
            viewRender();
        }
        catch (error) {
            console.log(error);
        }
    }
}

async function handleRemove() {
    await browser.storage.local.remove('key');
    viewRender();
}

function generateForm() {
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

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.id = "api-key-submit";
    submitButton.value = "Save API Key";

    form.appendChild(select);
    form.appendChild(inputKey);
    form.appendChild(submitButton);
    document.body.appendChild(form);
    form.addEventListener(`submit`, handleSubmit);
}

function removeForm() {
    const form = document.querySelector('#api-key-form');
    if(!!form) {
        document.body.removeChild(form);
    }
}

function generateInfo() {
    const container = document.createElement('div');
    const info = document.createElement('h1');
    const button = document.createElement('button');

    container.id = "api-key-info";
    info.innerHTML = "API Key is valid.";
    button.innerHTML = "Delete";
    container.appendChild(info);
    container.appendChild(button);
    document.body.appendChild(container);
    button.addEventListener(`click`, handleRemove);
}

function removeInfo() {
    const container = document.querySelector('#api-key-info');
    if(!!container) {
        document.body.removeChild(container);
    }
}

async function viewRender() {
    const isKey = await browser.storage.local.get('key')
    console.log(isKey);
    if(!!isKey.key) {
        removeForm();
        generateInfo();
    }
    else {
        removeInfo();
        generateForm();
    }
}
document.addEventListener('DOMContentLoaded', viewRender);
