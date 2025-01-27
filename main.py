from fastapi import FastAPI
from fastapi.responses import HTMLResponse

import markdown
from pydantic import BaseModel
from pydantic_settings import BaseSettings

from llama_parse import LlamaParse

app = FastAPI()

class Settings(BaseSettings):
    env: str
    debug: bool
    llama_cloud_api_key: str

    class Config:
        env_file = ".env"


class TextResource(BaseModel):
    text: str
    
class Document(BaseModel):
    id_: str
    text_resource: TextResource

# Instantiate settings
settings = Settings()

@app.get("/")
def read_root():
    return {
        "Hello": "World",
        "Debug": settings.debug
    }


@app.get("/parse",response_class=HTMLResponse)
def parse_pdf():
    parser = LlamaParse(
        api_key=settings.llama_cloud_api_key,
        result_type="markdown",
        verbose=True,
    )
    
    file_name = "idfc_bs.pdf"
    extra_info = {"file_name": file_name}
    
    with open(f"data/{file_name}", "rb") as f:
        documents = parser.load_data(f, extra_info=extra_info)
    
    html_content = ""
    for doc in documents:
        html_content += markdown.markdown(doc.text_resource.text)
    
    return HTMLResponse(content=html_content)