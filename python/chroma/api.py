from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from main import (
    index_pdf_to_chroma,
    index_markdown_to_chroma,
    add_sentence_to_chroma,
)
from query import query_rag  # Assuming you have this function in query.py

app = FastAPI()

class PDFInput(BaseModel):
    file_path: str
    collection_name: str

class MarkdownInput(BaseModel):
    markdown_content: str
    collection_name: str

class SentenceInput(BaseModel):
    sentence: str
    collection_name: str

class QueryInput(BaseModel):
    query: str
    collection_name: str
    n_results: Optional[int] = 3

@app.post("/index/pdf")
async def index_pdf(input_data: PDFInput):
    try:
        index_pdf_to_chroma(input_data.file_path, input_data.collection_name)
        return {"message": f"Successfully indexed PDF to collection {input_data.collection_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/index/markdown")
async def index_markdown(input_data: MarkdownInput):
    try:
        index_markdown_to_chroma(input_data.markdown_content, input_data.collection_name)
        return {"message": f"Successfully indexed markdown to collection {input_data.collection_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/add/sentence")
async def add_sentence(input_data: SentenceInput):
    try:
        add_sentence_to_chroma(input_data.sentence, input_data.collection_name)
        return {"message": f"Successfully added sentence to collection {input_data.collection_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query(input_data: QueryInput):
    try:
        formatted_response, response_text = query_rag(
            input_data.query,
            input_data.collection_name,
        )
        return {"formatted_response": formatted_response, "response_text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 