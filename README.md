# Arunabha Banerjee - Portfolio Chatbot Backend

This is the backend for **Arunabha Banerjee's Portfolio Chatbot**. It is a **RAG (Retrieval-Augmented Generation)** based AI agent built with **Node.js**, **Express**, and **LangChain.js**. It answers questions about Arunabha's skills, projects, and background by retrieving information from his personal documents.

## 🚀 Features

- **Framework**: Built with Node.js and Express. It is lightweight and fast.
- **AI Model**: Logic powered by **Groq** (using `llama3-70b-8192`) for incredibly fast inference.
- **RAG Architecture**: Uses **LangChain.js** RAG chains (`createRetrievalChain`) to answer queries based on custom data.
- **Vector Store**: Uses **HNSWLib** for efficient, local vector search.
- **Embeddings**: Uses **HuggingFace Transformers** (`Xenova/bge-small-en-v1.5`) running locally to create embeddings (no external API cost for embeddings).
- **Deployment Ready**: Configured for seamless deployment on **Render**.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Server**: Express.js
- **Orchestration**: LangChain.js
- **LLM Provider**: Groq
- **Vector DB**: HNSWLib (Node)
- **Embeddings**: @xenova/transformers

## 📂 Project Structure

```
.
├── documents/              # Source files for RAG (txt, json, pdf)
│   ├── arunabha.json
│   ├── arunabha.txt
│   └── portfolio-chatbot.pdf
├── vector_store/           # Generated vector index (created on startup)
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
├── index.js                # Main server entry point
├── vectorStore.js          # Logic for loading docs and creating index
└── package.json            # Dependencies
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- A [Groq API Key](https://console.groq.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd portfolio-chatbot
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your Groq API Key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```
*(Note: `PORT` is optional, defaults to 8000)*

### 4. Running Locally

Start the server:

```bash
npm start
```

On the first run, the system will:
1.  Read files from the `documents/` folder.
2.  Generate embeddings.
3.  Save the vector index to `vector_store/` directory.
4.  Start the API server.

### 5. API Usage

**Endpoint**: `POST /chatbot`

**Request Body**:
```json
{
  "message": "Who is Arunabha?"
}
```

**Response**:
```json
{
  "answer": "Arunabha Banerjee is a B.Tech student in Computer Science..."
}
```

## 🚀 Deployment (Render)

This project is configured for **Render**.

1.  Push your code to GitHub.
2.  Create a new **Web Service** on Render.
3.  Connect your repository.
4.  **Build Command**: `npm install`
5.  **Start Command**: `node index.js`
6.  **Environment Variables**: Add `GROQ_API_KEY` in the Render dashboard.

## 📄 Licensing

This project is open-source. Feel free to use it as a template for your own portfolio chatbot!
