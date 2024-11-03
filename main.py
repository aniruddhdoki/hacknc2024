import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import faiss
import pickle
from langchain.chat_models import ChatOpenAI
from langchain.agents import Tool, AgentExecutor, AgentType, ZeroShotAgent
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import CharacterTextSplitter
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain import LLMChain
from dotenv import load_dotenv

load_dotenv()

# Ensure the OpenAI API key is set
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# File paths for FAISS index and docstore metadata
FAISS_INDEX_PATH = "faiss_index.bin"
DOCSTORE_PATH = "docstore.pkl"
DATA_FILE_PATH = "data.json"  # Replace with your actual file path

# Initialize the chat model with OpenAI's GPT
chat_model = ChatOpenAI(
    model="gpt-4o-mini",  # Change to "gpt-4" if you have access
    temperature=0.7,
    max_tokens=1500,  # Increased to allow longer responses
)

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings()

# Check if FAISS index file and docstore exist
if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(DOCSTORE_PATH):
    # Load the FAISS index from file
    print("Loading FAISS index from file...")
    index = faiss.read_index(FAISS_INDEX_PATH)

    # Load the docstore and index_to_docstore_id mappings
    with open(DOCSTORE_PATH, "rb") as f:
        docstore, index_to_docstore_id = pickle.load(f)

    # Initialize FAISS vector store with loaded components
    vectorstore = FAISS(
        embedding_function=embeddings.embed_query,
        index=index,
        docstore=docstore,
        index_to_docstore_id=index_to_docstore_id
    )
else:
    # Load documents from a JSON file
    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        documents = [
            Document(page_content=item["text"]) for item in json_data
            if "text" in item and item["text"] is not None
        ]

    # Split the documents into chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)

    # Initialize FAISS vector store and populate with documents
    print("Creating new FAISS index...")
    vectorstore = FAISS.from_documents(docs, embeddings)

    # Save the FAISS index to disk
    faiss.write_index(vectorstore.index, FAISS_INDEX_PATH)

    # Save the docstore and index_to_docstore_id mappings
    with open(DOCSTORE_PATH, "wb") as f:
        pickle.dump((vectorstore.docstore, vectorstore.index_to_docstore_id), f)

    print("FAISS index and metadata saved to disk.")

# Set up a retrieval chain for document Q&A
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})

# Using a RetrievalQA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=chat_model,
    chain_type="stuff",  # Basic QA chain type
    retriever=retriever
)

# Define any additional tools
tools = [
    Tool(
        name="Document QA",
        func=qa_chain.run,
        description="Use this tool to answer questions based on the documents."
    )
]

# Create a custom prompt to encourage more detailed responses
custom_prompt = ZeroShotAgent.create_prompt(
    tools,
    prefix="""You are a highly knowledgeable assistant. When providing answers please make them concise and clear.""",
    suffix="""Answer the following question:

{input}

{agent_scratchpad}""",
    input_variables=["input", "agent_scratchpad"]
)

# Initialize the LLMChain with the custom prompt
llm_chain = LLMChain(llm=chat_model, prompt=custom_prompt)

# Create the agent with the LLMChain and tools
agent = ZeroShotAgent(llm_chain=llm_chain, tools=tools, verbose=True)

# Create an AgentExecutor
agent_executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
    # max_iterations=5
)

# Set up FastAPI app
app = FastAPI()

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")

    if not query:
        return {"error": "Please provide a query."}

    response = await agent_executor.arun(query)  # Use 'arun' for async execution
    return {"response": response}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run the server
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
