# ![ReplyAI]images/logo100x100.png) ReplyAI
## Wprowadzenie

**ReplyAI** to wtyczka dla Thunderbirda, która usprawnia proces odpowiadania na e-maile oraz zwiększa bezpieczeństwo korespondencji. Została zaprojektowana z myślą o użytkownikach, którzy chcą szybko i profesjonalnie odpowiadać na wiadomości, jednocześnie chroniąc się przed potencjalnymi zagrożeniami, takimi jak spam, phishing czy anomalie w treści e-maili. Jest szczególnie przydatna dla użytkowników akademickich, takich jak profesorowie, którzy muszą utrzymywać odpowiedni ton w komunikacji.

## Funkcje

- **Automatyczne generowanie odpowiedzi:**

  - **Pozytywne odpowiedzi:** Wyrażają zgodę na prośbę, np. na konsultacje, z zachowaniem zasad etykiety akademickiej.
  - **Negatywne odpowiedzi:** Uprzejmie odmawiają spełnienia prośby, np. przedłużenia terminu.
  - **Niestandardowe odpowiedzi:** Umożliwiają użytkownikowi określenie własnych instrukcji dla elastyczności.
  - Odpowiedzi są generowane z uwzględnieniem odpowiednich zwrotów grzecznościowych i zachęcają do dalszego kontaktu.

- **Klasyfikacja e-maili pod kątem bezpieczeństwa:**

  - **Spam:** Wykrywa niechciane wiadomości, takie jak reklamy.
  - **Phishing:** Ostrzega przed próbami wyłudzenia danych, np. poprzez podejrzane linki.
  - **Anomalie:** Identyfikuje nietypowe elementy, takie jak przyszłe daty w nagłówkach czy powtórzenia treści.
  - Klasyfikacja opiera się na wbudowanym filtrze Thunderbirda oraz analizie AI z API Gemini.

- **Integracja z Thunderbirdem:**

  - Wyświetlanie szczegółów e-maila (temat, nadawca, nagłówek "Received").
  - Oznaczanie wiadomości etykietami (np. \[SPAM\], \[PHISHING\], \[ANOMALIA\]) z odpowiednimi kolorami.
  - Szybkie odpowiadanie dzięki przyciskowi "Reply".

## Instalacja

Aby zainstalować ReplyAI jako rozszerzenie tymczasowe w Thunderbirdzie, wykonaj następujące kroki:

1. Otwórz Thunderbirda i przejdź do `Dodatki i motywy` &gt; `Zarządzaj rozszerzeniami` &gt; `Debuguj dodatki`.
2. W sekcji `Rozszerzenia tymczasowe` kliknij `Tymczasowo wczytaj dodatek`.
3. Wybierz plik `manifest.json` z folderu wtyczki ReplyAI.
4. Po załadowaniu ikona ReplyAI pojawi się w pasku narzędzi Thunderbirda.
5. Skonfiguruj klucz API Gemini, klikając ikonę ReplyAI i postępując zgodnie z instrukcjami w panelu `mainPopup`.

**Uwaga:** Klucz API Gemini jest wymagany do funkcji opartych na AI. Uzyskaj klucz z platformy Gemini API i wprowadź go w panelu `mainPopup`.

## Instrukcje użytkowania

ReplyAI integruje się z Thunderbirdem poprzez trzy panele (popupy), które ułatwiają korzystanie z jego funkcji:

### MainPopup: Konfiguracja klucza API

- Służy do wprowadzania i zarządzania kluczem API, niezbędnym do funkcji AI.
- Jeśli klucz nie jest zapisany, wyświetla formularz do jego wprowadzenia.
- Po zapisaniu pokazuje zapisany klucz z opcją jego usunięcia.
- **Kroki:**
  1. Kliknij ikonę ReplyAI w pasku narzędzi.
  2. Wprowadź klucz API Gemini i kliknij `Zapisz klucz API`.
  3. Sprawdź, czy klucz został zapisany, lub usuń go, jeśli potrzebujesz zmiany.

### MessagePopup: Szczegóły e-maila i szybka odpowiedź

- Wyświetla temat, nadawcę i nagłówek "Received" wybranego e-maila.
- Klasyfikuje e-mail pod kątem spamu, phishingu i anomalii, oznaczając go etykietami (np. \[SPAM\] w kolorze pomarańczowym).
- Zawiera przycisk "Reply" do szybkiego rozpoczęcia odpowiedzi.
- **Kroki:**
  1. Wybierz e-mail w skrzynce odbiorczej.
  2. Kliknij ikonę ReplyAI, aby otworzyć `messagePopup`.
  3. Sprawdź szczegóły e-maila i klasyfikację bezpieczeństwa.
  4. Kliknij "Reply", aby rozpocząć odpowiedź.

### ComposePopup: Generowanie odpowiedzi

- Oferuje przyciski do generowania odpowiedzi pozytywnych, negatywnych lub niestandardowych.
- Dla odpowiedzi niestandardowych dostępny jest formularz do wprowadzenia własnych instrukcji.
- Po wygenerowaniu odpowiedź jest wstawiana do okna komponowania wiadomości.
- **Kroki:**
  1. Otwórz okno komponowania nowej wiadomości lub odpowiedzi.
  2. Kliknij ikonę ReplyAI, aby otworzyć `composePopup`.
  3. Wybierz typ odpowiedzi (pozytywna, negatywna lub niestandardowa).
  4. Dla niestandardowej odpowiedzi wprowadź instrukcje w formularzu.
  5. Kliknij przycisk, aby wygenerować odpowiedź i wstawić ją do wiadomości.


## Rozwiązywanie problemów

- **Wtyczka nie ładuje się:** Upewnij się, że plik `manifest.json` jest poprawnie sformatowany i znajduje się w folderze wtyczki.
- **Problemy z kluczem API:** Sprawdź, czy klucz API Gemini jest poprawny i ma odpowiednie uprawnienia.
- **Brak odpowiedzi AI:** Upewnij się, że klucz API jest zapisany i połączenie z internetem działa.

## FAQ

- **Jak uzyskać klucz API Gemini?**\
  Odwiedź Gemini API i postępuj zgodnie z instrukcjami, aby uzyskać klucz.
- **Czy wtyczka działa bez klucza API?**\
  Funkcje oparte na AI wymagają klucza API, ale klasyfikacja Thunderbirda działa bez niego.


## Licencja

do uzulełnieniia

## Dodatkowe informacje

- **Wymagania systemowe:** Thunderbird w wersji 128.0 lub nowszej.
- **Wsparcie:** Problemy można zgłaszać przez stronę Thunderbirda lub kontakt z autorem.
- **Przyszłe plany:** Dodanie wsparcia dla dodatkowych języków, ulepszenie klasyfikacji AI i integracja z innymi platformami AI.



