# LinguaFlow — Language Translation Tool
**CodeAlpha AI Internship · Task 1**

A full-stack Language Translation Tool built with **FastAPI** (Python backend) and a custom dark-themed HTML/CSS/JS frontend, powered by **Google Translate** via the `deep-translator` library.

---

## 🚀 Features

- **100+ languages** supported (auto-detect source included)
- **Swap** source & target languages instantly
- **Copy** translated text to clipboard with one click
- **Text-to-Speech** for both input and output text (browser Web Speech API)
- **Paste** from clipboard directly into the input box
- **Translation history** — last 20 translations saved locally (localStorage)
- **Keyboard shortcut**: `Ctrl + Enter` to translate
- Clean, responsive **dark-themed UI** with animated background

---

## 📁 Project Structure

```
language_translator/
├── main.py               # FastAPI backend
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Jinja2 HTML template
└── static/
    ├── style.css         # Stylesheet
    └── app.js            # Frontend JavaScript
```

---

## ⚙️ Setup & Run

### 1. Clone / Download
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_LanguageTranslationTool
cd CodeAlpha_LanguageTranslationTool
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python main.py
```

### 5. Open in Browser
```
http://localhost:8000
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | FastAPI, Uvicorn                    |
| AI/NLP    | deep-translator (Google Translate)  |
| Frontend  | HTML5, CSS3 (custom), Vanilla JS    |
| Templating| Jinja2                              |
| TTS       | Web Speech API (browser-native)     |

---

## 📡 API Endpoints

| Method | Endpoint      | Description               |
|--------|---------------|---------------------------|
| GET    | `/`           | Serve the web UI          |
| GET    | `/languages`  | Return all supported langs|
| POST   | `/translate`  | Translate text            |

### POST `/translate` — Request Body
```json
{
  "text": "Hello, world!",
  "source_lang": "auto",
  "target_lang": "ur"
}
```

### Response
```json
{
  "translated_text": "ہیلو دنیا!",
  "source_lang": "auto",
  "target_lang": "ur",
  "char_count": 13
}
```

---

## 📝 Notes

- No API key required — `deep-translator` uses the free Google Translate endpoint.
- Max input length: 5000 characters per request.
- For production use, consider rate limiting or using an official paid API key.

---

## 👤 Author
Built during **CodeAlpha AI Internship**  
GitHub: [github.com/YOUR_USERNAME](https://github.com/YOUR_USERNAME)  
LinkedIn: Post with `#CodeAlpha` tagging `@CodeAlpha`
