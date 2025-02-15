from collections import defaultdict
from typing import Any, List, Optional
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from llama_parse import LlamaParse
from tabulate import tabulate
from app.core.config import settings
from app.core.utils import get_retrieval_qa,get_chat_model,get_retriever,get_custom_prompt,split_markdown,make_retriever,get_markdown_table_as_df,sha256_hash,process_analyzer_response,get_analyzer_prompt,get_analyzer_input,merge_dataframes
import re
import os
import time
import pandas as pd
import json

router = APIRouter(tags=["conversation"])
markdown_dir = "/Users/harishgokul/Finsights/backend/data"

@router.get("/")
def read_root():
    return {
        "debug": settings.debug
    }

@router.post("/submit", response_class=JSONResponse)
async def parse_pdf( file: UploadFile = File(...)):
    time.sleep(3)
    file_content = await file.read()
    hash = sha256_hash(file_content) 
    file_path = f"{markdown_dir}/{hash}.pdf"
    markdown_file_path = file_path.replace(".pdf",".md")
    
    if os.path.exists(markdown_file_path):
        print(f"Existing document found with id: {hash}")
        return JSONResponse(content={
            "id": hash,
       } )
    
    parser = LlamaParse(
        api_key=settings.llama_cloud_api_key,
        result_type="markdown",
        verbose=True,
        show_progress=True,
        premium_mode = True,
    )
        
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    extra_info = {"file_name": hash}
    documents = await parser.aload_data(file_path, extra_info)

    os.makedirs(markdown_dir, exist_ok=True)
    
    markdown_file_path = os.path.join(markdown_dir, f"{hash}.md")
    extracted_text = [doc.text_resource.text for doc in documents]

    with open(markdown_file_path, "w", encoding="utf-8") as markdown_file:
        markdown_file.write("\n\n".join(extracted_text))

    os.remove(file_path)
    
    docs = split_markdown(markdown_file_path)
    
    ## adds it to the store.TODO: rename and make interface better
    
    make_retriever(hash,{
        "docs": docs, 
        "metadata": extra_info
    }) 
    
    return JSONResponse(content={
        "id": hash,
    })


class QueryRequest(BaseModel):
    id: str # Unique identifier for a document
    query: str  # The query field that will be passed in the request body

@router.post("/query",response_class=JSONResponse)
async def get_chat_response(req:QueryRequest):
    try:        
        question = req.query
        chat_model = get_chat_model()
        retriever, _ = get_retriever(req.id)
        
        if retriever is None:
            print("Markdown found, but no retriever for id: " + req.id)
            file_path = os.path.join(markdown_dir, f"{req.id}.md")
            docs = split_markdown(file_path)
            retriever = make_retriever(req.id, {"docs":docs, "metadata":{"file_name": req.id}})
            print(retriever)
        
        prompt = get_custom_prompt()
        
        qa = get_retrieval_qa(
            chat_model=chat_model,
            retriever=retriever,
            prompt=prompt
        )
        
        response = qa.invoke({"query": question})
        content = response["result"]
        extracted_markdown = ""
        match = re.search(r"```markdown\n(.*?)\n```", content, re.DOTALL)
        if match:
            extracted_markdown = match.group(1)
        else:
            extracted_markdown = content
        return JSONResponse(
            status_code=200,
            content={
                "result":extracted_markdown,
                "source_documents": [doc.page_content.strip().replace("\n", " ").replace("\r", " ") for doc in response["source_documents"]]
            }
        )
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "An error occurred while processing the request."})

class GetTableRequest(BaseModel):
    id: str # Unique identifier for a document

@router.post("/get_tables",response_class=JSONResponse)
async def get_tables(req:GetTableRequest):
    try:        
        file_path = f"{markdown_dir}/{req.id}.md"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
        dataframes: dict[Any, pd.DataFrame] = get_markdown_table_as_df(content=content)

        target_columns_pattern = r"(description|transaction|particular)(?!.*date)"
        date_column_pattern = r"date"

        filtered_dataframes = defaultdict(list)

        for key, df in dataframes.items():
            lkey = list(key)
            date_columns = [col for col in lkey if re.search(date_column_pattern, col, re.IGNORECASE)]
            target_columns = [col for col in lkey if re.search(target_columns_pattern, col, re.IGNORECASE)]
            
            if date_columns and target_columns:
                df = df.reset_index(drop=True)  
                df.insert(0, "id", range(1, len(df) + 1))
                df.rename(columns={target_columns[0]: "transaction"}, inplace=True)
                df.rename(columns={date_columns[0]: "date"}, inplace=True)
                filtered_dataframes[str(key)] = df

        merged_df = merge_dataframes(filtered_dataframes)
        print(tabulate(merged_df, headers='keys', tablefmt='pretty'))
                    
        return JSONResponse(
            status_code=200,
            content={
                "result": [merged_df.to_json(orient="records")],
            }
        )
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "An error occurred while processing the request."})
    

@router.post("/get_insights", response_class=JSONResponse)
async def get_insights(req:GetTableRequest):
    try:        
        file_path = f"{markdown_dir}/{req.id}.md"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
        dataframes: dict[Any, pd.DataFrame] = get_markdown_table_as_df(content=content)

        target_columns_pattern = r"(description|transaction|particular)(?!.*date)"
        date_column_pattern = r"date"

        filtered_dataframes = defaultdict(list)

        for key, df in dataframes.items():
            lkey = list(key)
            date_columns = [col for col in lkey if re.search(date_column_pattern, col, re.IGNORECASE)]
            target_columns = [col for col in lkey if re.search(target_columns_pattern, col, re.IGNORECASE)]
            
            if date_columns and target_columns:
                df = df.reset_index(drop=True)  
                df.insert(0, "id", range(1, len(df) + 1))
                df.rename(columns={target_columns[0]: "transaction"}, inplace=True)
                df.rename(columns={date_columns[0]: "date"}, inplace=True)
                filtered_dataframes[str(key)] = df
                
        table_data = ""
        merged_df = merge_dataframes(filtered_dataframes)
        table_data = tabulate(merged_df, headers='keys', tablefmt='pretty')
                
        prompt = get_analyzer_prompt()
        input = get_analyzer_input(table_data)
        chat_model = get_chat_model()
        chain = prompt | chat_model
        message = chain.invoke({"input": input})
        
        response = process_analyzer_response(message)
        if response is None:
            return JSONResponse(status_code=200, content={"result": "No insights found."})
                    
        return JSONResponse(
            status_code=200,
            content={
                "result":response,
            }
        )
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "An error occurred while processing the request."})