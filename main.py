# main.py

import os
from fastapi import FastAPI, Request
import uvicorn
from langchain.chat_models import ChatAnthropic
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.utilities import SerpAPIWrapper
from llama_index import (
    VectorStoreIndex,
    LLMPredictor,
    ServiceContext,
    PromptHelper,
    Document,
    SimpleNodeParser,
)
from llama_index.vector_stores.lancedb import LanceDBVectorStore
import lancedb
import json

# Set up API keys
os.environ["ANTHROPIC_API_KEY"] = 'your-anthropic-api-key'
os.environ["SERPAPI_API_KEY"] = 'your-serpapi-api-key'

# Load JSON data
with open('v1 dataset.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# Extract documents
documents = []
for item in json_data['documents']:
    text = item['text']
    doc = Document(text=text)
    documents.append(doc)

# Initialize the parser
parser = SimpleNodeParser()

# Parse documents into nodes (chunks)
nodes = parser.get_nodes_from_documents(documents)

# Initialize LanceDB
db = lancedb.connect("./lancedb")
try:
    table = db.create_table("documents")
except:
    table = db.open_table("documents")

# Initialize vector store
vector_store = LanceDBVectorStore(
    table=table,
    dimension=1536,  # Adjust based on your embedding model
)

# Initialize the chat model
chat_model = ChatAnthropic(
    model="claude-3-5-sonnet-20260620",
    temperature=0.7,
    max_tokens_to_sample=1000,
)

# Set up LLMPredictor and PromptHelper
llm_predictor = LLMPredictor(llm=chat_model)

prompt_helper = PromptHelper(
    max_input_size=4096,
    num_output=1000,
    max_chunk_overlap=20,
    chunk_size_limit=600,
)

# Create service context
service_context = ServiceContext.from_defaults(
    llm_predictor=llm_predictor,
    prompt_helper=prompt_helper,
)

# Build the index with chunked nodes
index = VectorStoreIndex(
    nodes,
    service_context=service_context,
    vector_store=vector_store,
)

# Define tools
def retrieve_documents(query):
    response = index.as_query_engine().query(query)
    return str(response)

document_tool = Tool(
    name="Document Retrieval",
    func=retrieve_documents,
    description="Use this tool to search for information in the document database.",
)

search = SerpAPIWrapper()

search_tool = Tool(
    name="Web Search",
    func=search.run,
    description="Use this tool to search the web for up-to-date information.",
)

tools = [document_tool, search_tool]

# Set up conversation memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
)

# Initialize the agent
agent = initialize_agent(
    tools=tools,
    llm=chat_model,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)

# Set up FastAPI app
app = FastAPI()

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")

    if not query:
        return {"error": "Please provide a query."}

    if query.lower() == "reset_memory":
        memory.clear()
        return {"response": "Memory has been reset."}
    else:
        response = agent.run(query)
        return {"response": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
