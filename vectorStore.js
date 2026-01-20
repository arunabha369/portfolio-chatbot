import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";

const VECTOR_DIR = "vector_store";
const DOCUMENTS_DIR = "documents";

// Initialize embeddings (equivalent to FastEmbedEmbeddings / BAAI/bge-small-en-v1.5)
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/bge-small-en-v1.5",
});

export async function getVectorStore() {
  if (fs.existsSync(path.join(VECTOR_DIR, "hnswlib.index"))) {
    console.log("Loading existing vector store...");
    const vectorStore = await HNSWLib.load(VECTOR_DIR, embeddings);
    return vectorStore;
  } else {
    console.log("Creating new vector store. Please wait...");
    
    // Check if documents exist in documents folder
    // Note: The original code referenced specific files. 
    // We will look for them in the 'documents' folder or create dummy docs if empty to avoid crashing.
    
    const docs = [];
    
    const files = [
        { name: "arunabha.txt", loader: TextLoader },
        { name: "arunabha.json", loader: JSONLoader }, 
        { name: "portfolio-chatbot.pdf", loader: PDFLoader }
    ];

    for (const file of files) {
        const filePath = path.join(DOCUMENTS_DIR, file.name);
        if (fs.existsSync(filePath)) {
            console.log(`Loading ${file.name}...`);
            try {
                const loader = new file.loader(filePath);
                const loadedDocs = await loader.load();
                docs.push(...loadedDocs);
            } catch (error) {
                console.error(`Error loading ${file.name}:`, error);
            }
        } else {
            console.warn(`File ${file.name} not found in ${DOCUMENTS_DIR}.`);
        }
    }

    if (docs.length === 0) {
        console.warn("No documents found. initializing with a dummy document.");
        docs.push({ pageContent: "This is a placeholder document because no source files were found.", metadata: {} });
    }

    // Split documents
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Create and save vector store
    const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
    await vectorStore.save(VECTOR_DIR);
    
    console.log("Vector store created and saved.");
    return vectorStore;
  }
}
