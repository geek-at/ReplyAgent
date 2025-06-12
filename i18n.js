document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const message = browser.i18n.getMessage(key);
      if (message) {
        el.textContent = message;
      } else {
        console.warn(`Brak tłumaczenia dla klucza: ${key}`);
      }
    });
  });
  