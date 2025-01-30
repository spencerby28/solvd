# pip install chromadb langchain-community langchain-core sentence-transformers
import chromadb
from dotenv import load_dotenv
import os
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
from langchain_core.documents import Document

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

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

def index_pdf_to_chroma(file_path, collection_name):
    loader = PyPDFLoader(file_path)
    document = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunked_documents = text_splitter.split_documents(document)

    Chroma.from_documents(
        documents=chunked_documents,
        embedding=embedding_function,
        collection_name=collection_name,
        client=client,
    )
    print(f"Added {len(chunked_documents)} chunks to chroma db in collection '{collection_name}'")

def index_markdown_to_chroma(markdown_content, collection_name):
    # First split by headers, but only track H1 and H2 to keep metadata small
    headers_to_split_on = [
        ("#", "Title"),     # Using shorter metadata keys
        ("##", "Section"),  # Only tracking 2 levels of headers
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on,
        strip_headers=True  # Remove headers from content to reduce duplication
    )
    md_header_splits = markdown_splitter.split_text(markdown_content)
    
    # Then split by character length if needed
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunked_documents = text_splitter.split_documents(md_header_splits)

    Chroma.from_documents(
        documents=chunked_documents,
        embedding=embedding_function,
        collection_name=collection_name,
        client=client,
    )
    print(f"Added {len(chunked_documents)} chunks to chroma db in collection '{collection_name}'")

def add_sentence_to_chroma(sentence, collection_name):
    """Add a single sentence to an existing Chroma collection."""
    # Create a Document object from the sentence
    doc = Document(page_content=sentence)
    
    Chroma.from_documents(
        documents=[doc],
        embedding=embedding_function,
        collection_name=collection_name,
        client=client,
    )
    print(f"Added sentence to chroma db in collection '{collection_name}'")

# Example usage
#index_pdf_to_chroma("./nvidia.pdf", "your_collection_name")
#coconut_md = open("./coconut.md", "r").read()
#index_markdown_to_chroma(coconut_md, "coconut")

# Example of adding a single sentence
#add_sentence_to_chroma("Coconuts, VA's cost on average $14-16 per hour depending on the VA's experience and expertise.", "coconut")