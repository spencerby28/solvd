import os
from dotenv import load_dotenv
import chromadb
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from main import client, embedding_function
from langchain_community.vectorstores import Chroma

load_dotenv()

client = chromadb.HttpClient(
    ssl=True,
    host='api.trychroma.com',
    tenant='99476425-2921-44b0-8b81-48be9f979971',
    database='solvd',
    headers={
        'x-chroma-token': os.getenv('CHROMA_API_KEY')
    }
)

embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
collection = client.get_collection(name="coconut")


PROMPT_TEMPLATE = """Based on the following context, please answer the question. You are answer questions about a company called Coconut. If you cannot answer the question based on the context, please state that.

Context:
{context}

Question:
{question}

Answer:"""

def query_rag(query_text: str, collection_name: str = "coconut") -> tuple[str, str]:
    """
    Query a Retrieval-Augmented Generation (RAG) system using Chroma database and OpenAI.
    
    Args:
        query_text (str): The text to query the RAG system with.
        collection_name (str): Name of the collection to query
    
    Returns:
        tuple[str, str]: A tuple containing:
            - formatted_response (str): Formatted response including the generated text and sources
            - response_text (str): The generated response text
    """
    # Get the collection dynamically instead of using global variable
    collection = client.get_collection(name=collection_name)
    
    # Query the collection
    results = collection.query(
        query_texts=[query_text],
        n_results=3
    )
    
    # Check if there are any matching results
    if not results['documents'][0]:
        return "Unable to find matching results.", ""
    
    # Combine context from matching documents
    context_text = "\n\n---\n\n".join(results['documents'][0])
    
    # Create prompt template using context and query text
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    
    # Initialize OpenAI chat model
    model = ChatOpenAI(model_name="gpt-4o-mini", api_key=os.getenv('OPENAI_KEY'))
    
    # Generate response text based on the prompt
    response_text = model.invoke(prompt).content
    
    # Get sources (metadata) from the results
    sources = results['metadatas'][0] if results['metadatas'] else []
    
    # Format the response
    formatted_response = f"Response: {response_text}\nSources: {sources}"
    
    return formatted_response, response_text



# Example usage
if __name__ == "__main__":
    query = "What can coconut do for my business?"
    formatted_response, response_text = query_rag(query)
    print(formatted_response)