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
        }
        catch (error) {
            console.log(error);
        }
    }
}

form.addEventListener(`submit`, handleSubmit);