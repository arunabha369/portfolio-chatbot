import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getVectorStore } from "./vectorStore.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "HEAD"],
  allowedHeaders: ["*"],
}));

app.use(express.json());

// Store chat history in memory (simple in-memory storage for demo)
// In a real app, you'd use a database or a more robust memory solution keyed by session ID
const chatHistory = [];

let chain = null;
let model = null;

async function initializeChain() {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.error("Error: GROQ_API_KEY is not set in environment variables.");
            return;
        }

        model = new ChatGroq({
            apiKey: groqApiKey,
            modelName: "openai/gpt-oss-120b",
            temperature: 0.7,
        });

        const vectorStore = await getVectorStore();
        // const retriever = vectorStore.asRetriever();
        const retriever = vectorStore.asRetriever({
            k: 3,
            searchType: "similarity",
        });


        // 1. Contextualize question: Rephrase user question based on history
        const contextualizeQSystemPrompt = `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.`;
        
        const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
            ["system", contextualizeQSystemPrompt],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        const historyAwareRetriever = await createHistoryAwareRetriever({
            llm: model,
            retriever: retriever,
            rephrasePrompt: contextualizeQPrompt,
        });

        // 2. Answer question: Answer based on retrieved context
        const systemPrompt = `You are 'Arunabha AI' — a friendly, confident, and professional AI version of Arunabha Banerjee.

Your role:
- Speak naturally, like Arunabha explaining his own work.
- Always answer in a conversational, human tone — never like a report or documentation.
- Keep responses concise (about 4–5 sentences maximum).
- Never use tables, markdown tables, or structured columns.
- Use simple paragraphs or short bullet points if needed.
- Focus on clarity, natural flow, and friendly explanations.
- When asked about projects or skills, summarize briefly (purpose, tools, and what was learned).
- Do not list unnecessary technical details unless explicitly asked.
- If the user asks about multiple things, list them clearly in bullet or sentence form — never as a table.
- If you are not sure, reply with: "I'm not sure about that yet, but Arunabha can tell you more!"

<context>
{context}
</context>`;

        const qaPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemPrompt],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        const questionAnswerChain = await createStuffDocumentsChain({
            llm: model,
            prompt: qaPrompt,
        });

        chain = await createRetrievalChain({
            retriever: historyAwareRetriever,
            combineDocsChain: questionAnswerChain,
        });
        
        console.log("Chain initialized successfully (Modern Architecture).");

    } catch (error) {
        console.error("Failed to initialize chain:", error);
    }
}

// Initialize on startup
initializeChain();

app.get("/", (req, res) => {
  res.json({ status: "active", message: "Arunabha Chatbot is Awake! 🚀" });
});

app.head("/", (req, res) => {
  res.status(200).json({ status: "active" });
});

app.post("/chatbot", async (req, res) => {
  try {
    if (!chain) {
        await initializeChain();
        if (!chain) {
            return res.status(503).json({ answer: "System is initializing or failed to initialize, please try again in a moment." });
        }
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ answer: "Message is required." });
    }

    // Invoke the chain
    const result = await chain.invoke({
        input: message,
        chatHistory: chatHistory,
    });
    
    // Update chat history
    chatHistory.push(new HumanMessage(message));
    chatHistory.push(new AIMessage(result.answer));
    
    // Keep history manageable (e.g., last 20 messages)
    if (chatHistory.length > 20) {
        chatHistory.splice(0, chatHistory.length - 20);
    }

    res.json({ answer: result.answer });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ answer: `Sorry, something went wrong: ${error.message}` });
  }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
