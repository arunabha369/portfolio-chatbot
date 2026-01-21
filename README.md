# Arunabha Banerjee - Portfolio Chatbot Backend

This is the intelligent backend for **Arunabha Banerjee's Portfolio Chatbot**. It uses **RAG (Retrieval-Augmented Generation)** to answer questions about Arunabha's professional background, skills, and projects by retrieving context from his personal documents.

Built with **Node.js**, **Express**, **LangChain.js**, and **Groq (Llama 3)**.

---

## 🚀 Features

- **⚡ Blazing Fast AI Model**: Logic powered by **Groq** (using `openai/gpt-oss-120b`) for incredibly fast inference.
- **🧠 Local RAG System**: Uses **HNSWLib** for efficient, local vector storage and retrieval.
- **🔍 Intelligent Embeddings**: Currently configured to use **HuggingFace Transformers** (`Xenova/bge-small-en-v1.5`) for local embedding generation.
- **💬 Contextual Memory**: Remembers previous turn of conversation for natural follow-up questions.
- **🤖 Custom Persona**: "Arunabha AI" speaks in a friendly, professional tone representing Arunabha.
- **📂 Multi-Format Support**: Ingests data from `JSON`, `TXT`, and `PDF` files.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Runtime** | Node.js | JavaScript runtime environment |
| **Server** | Express.js | REST API framework |
| **Orchestration** | LangChain.js | Framework for building LLM applications |
| **LLM** | Groq (GPT-OSS 120B) | High-performance inference engine |
| **Vector DB** | HNSWLib (Node) | In-memory approximate nearest neighbor search |
| **Embeddings** | @xenova/transformers | Local embedding model (ONNX Runtime) |

---

## 📂 Project Structure

```bash
.
├── documents/              # 📚 Source Knowledge Base
│   ├── arunabha.json       # Structured data (skills, contact)
│   ├── arunabha.txt        # Unstructured text (bio, about me)
│   └── portfolio-chatbot.pdf # Project specific details
├── vector_store/           # 🧠 Generated Vector Index (Created on startup)
├── .env                    # 🔐 Environment Variables (API Keys)
├── .gitignore              # 🙈 Git Ignore definitions
├── index.js                # 🚀 Main Application Entry Point
├── vectorStore.js          # ⚙️ Logic for RAG & Embeddings
└── package.json            # 📦 Project Dependencies
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **Groq API Key**: Get one for free at [console.groq.com](https://console.groq.com/)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd portfolio-chatbot
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Required for LLM Inference
GROQ_API_KEY=gsk_...

# Optional: Server Port (Defaults to 8000)
PORT=8000

# Optional: If you switch to Google Embeddings later
# GEMINI_API_KEY=...
```

### 4. Running Locally

Start the server:

```bash
npm start
```

**What happens on start?**
1.  The server checks for the `vector_store/` directory.
2.  If missing or if you modify `vectorStore.js`, it reads all files in `documents/`.
3.  It generates embeddings using the local model (this may take a few seconds).
4.  It saves the index to disk.
5.  The API starts listening on port 8000.

---

## 📡 API Usage

The backend exposes a single endpoint for chat interactions.

### Endpoint: `POST /chatbot`

#### Request
```json
{
  "message": "Who is Arunabha?"
}
```

#### Success Response (200 OK)
```json
{
  "answer": "Arunabha Banerjee is a Computer Science student at..."
}
```

#### Error Response
```json
{
  "answer": "Sorry, something went wrong: [Error Details]"
}
```

---

## ☁️ Deployment Guide (Render / Cloud)

### 💡 Pro Tip: The "Free Tier Hack"
**Why pay for RAM when you can be smart?** 🧠

Generating embeddings is heavy work (~1GB RAM). Render's free tier only gives you 512MB, which causes the server to crash if it tries to build the index on startup.

**The Fix:**
We commit the **pre-built** `vector_store/` folder to GitHub.
- **Locally**: Your computer does the heavy lifting (generating embeddings).
- **Render**: The server just loads the finished file. Zero stress. Zero crashes.

**Steps:**
1.  Run `npm start` locally once to generate `vector_store/`.
2.  Push it to GitHub (it's already allowed in `.gitignore`).
3.  Deploy. Enjoy your free hosting! 🎉

### Steps to Deploy
1.  Push code (including `vector_store/`) to **GitHub**.
2.  Create a **Web Service** on Render/Railway/Heroku.
3.  Set **Build Command**: `npm install`
4.  Set **Start Command**: `node index.js`
5.  Add Environment Variable: `GROQ_API_KEY`

---

## 📝 Customization

### Adding New Knowledge
1.  Place any `.txt`, `.json`, or `.pdf` file in the `documents/` folder.
2.  Delete the `vector_store/` folder to force a rebuild.
3.  Restart the server: `npm start`.

### Changing the Personality
Edit the `systemPrompt` in `index.js` to change how the AI behaves (e.g., tone, style, specific instructions).

---

## 📄 License
This project is open-source.
