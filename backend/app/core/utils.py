from typing import List, Optional
from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings
import chromadb
from langchain_community.vectorstores import Chroma
import vertexai
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_core.documents import Document
from collections import OrderedDict
from app.core.config import settings

import hashlib
import nltk
import pandas as pd
import json
from collections import defaultdict
from tabulate import tabulate
from pytablereader import MarkdownTableTextLoader
from langchain_core.prompts import ChatPromptTemplate

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def init_nltk_deps():
    nltk.download('punkt_tab')
    nltk.download('averaged_perceptron_tagger_eng')


def init_vertex_ai():
    PROJECT_ID = "planar-cistern-448818-f5"  
    REGION = "us-central1" 
    vertexai.init(project=PROJECT_ID, location=REGION)


def make_store(id:str,docs) -> tuple[Chroma, object]:
    try:
        model = VertexAIEmbeddings(model="text-embedding-005")
    except Exception as e:
        raise RuntimeError(f"Error initializing VertexAI model: {str(e)}")

    # TODO: revisit this initialization
    store = Chroma.from_documents(
        documents=docs,
        embedding=model,
        collection_name= id #TODO: revisit this
    ) 
    
    print('Vector DB created successfully!')
    return store, model


def make_retriever(id: Optional[str], data: dict) -> chromadb.Client:
    kv_store = KeyValueStore()
    if not id: 
        id = "default"
    
    if kv_store.get(id):
        print("Cached Retriever present in store with id: {}".format(id))
        return kv_store.get(id)
    else:
        collection_id = f"rag-{kv_store.len()}"
        store, _ = make_store(collection_id,data["docs"])
        retriever = store.as_retriever()
        kv_store.set(id, (retriever,data["metadata"]))
        print("Created new Retriever and stored in store with id: {}".format(id))
        return retriever

def get_retriever(id: Optional[str]) -> chromadb.Client:
    kv_store = KeyValueStore()
    if not id: 
        id = "default"
    
    if kv_store.get(id):
        print("Using Cached Retriever with id: {}".format(id))
        return kv_store.get(id)
    else:
        return (None,None)

def get_custom_prompt():
    """
    Prompt template for QA retrieval for each vectorstore
    """
    custom_prompt_template = """Use the following pieces of information to answer the user's question.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    Context: {context}
    Question: {question}

    Only return the helpful answer below and nothing else. Return the result in markdown format.
    Helpful answer:
    """
    
    
    prompt_2 ="""
    You are an Information Retrieval Agent designed to extract information from bank statements and present it in markdown format.

        Instructions:
        1. You will receive a question and a context representing a bank statement.
        2. Extract the information requested in the question from the provided context.
        3. Format the extracted information as markdown.
        4. Do not hallucinate any information that is not present in the context. If the requested information is not available, simply state "Information not found."
        5. Output the markdown formatted information.

        Question: {question}

        Context: {context}
        
        Helpful answer:
    """
    
    
    prompt = PromptTemplate(template=prompt_2,
                            input_variables=['context', 'question'])
    return prompt

def get_chat_model():
    try:
        chat_model = ChatVertexAI(model_name="gemini-2.0-flash-exp",project="planar-cistern-448818-f5")
        return chat_model
    except Exception as e:
        raise RuntimeError(f"Error initializing VertexAI Chat Model: {str(e)}")


def get_retrieval_qa(chat_model, retriever, prompt: PromptTemplate) -> RetrievalQA:
    """
    Creates and returns a RetrievalQA instance.

    Args:
        chat_model (ChatModel): The LLM model used for question answering.
        retriever (Retriever): The retriever to fetch relevant documents for QA.
        prompt (str): The prompt template to guide the model.

    Returns:
        RetrievalQA: An instance of the RetrievalQA chain.
    """
    qa = RetrievalQA.from_chain_type(
        llm=chat_model,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )
    return qa

def split_markdown(file_path: str) -> List[Document]:
    loader = UnstructuredMarkdownLoader(file_path)
    markdown_document = loader.load()
    headers_to_split_on = [("#", "Header 1"),("##", "Header 2"),("###", "Header 3")]

    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on,strip_headers=False)
    splits = markdown_splitter.split_text(markdown_document[0].page_content)
    return splits

def get_markdown_table_as_df(content: str):
    reader = MarkdownTableTextLoader(text=content)

    table_groups = defaultdict(list)

    for table in reader.load():
        headers = tuple(table.headers)
        table_groups[headers].extend(table.rows)

    dataframes = {headers: pd.DataFrame(rows, columns=headers) for headers, rows in table_groups.items()}

    if settings.debug:
        for headers, df in dataframes.items():
            print(f"Table with headers {headers}:")
            print(tabulate(df, headers='keys', tablefmt='pretty'))
        
    return dataframes


# Standardized schema for transaction tables
STANDARD_SCHEMA = ['Date', 'Description', 'Transaction', 'Type', 'Debit', 'Credit', 'Balance']

def map_headers_to_standard(headers_list):
    """
    Maps extracted table headers to a standardized schema using TF-IDF and cosine similarity.
    """
    # Flatten the headers and remove duplicates
    all_headers = list(set(sum(headers_list, [])))
    
    # Combine extracted headers with the standard schema for vectorization
    combined_headers = all_headers + STANDARD_SCHEMA

    # Convert headers into TF-IDF vectors
    vectorizer = TfidfVectorizer().fit_transform(combined_headers)
    vectors = vectorizer.toarray()

    # Separate vectors for original headers and standard schema
    original_vectors = vectors[:len(all_headers)]
    standard_vectors = vectors[len(all_headers):]

    # Compute cosine similarity
    similarity_matrix = cosine_similarity(original_vectors, standard_vectors)

    # Map headers to the most similar standardized header
    header_mapping = {}
    for idx, header in enumerate(all_headers):
        most_similar_index = similarity_matrix[idx].argmax()
        header_mapping[header] = STANDARD_SCHEMA[most_similar_index]
    
    return header_mapping

def extract_and_standardize_tables(markdown_content):
    """
    Extracts tables from markdown content, standardizes column headers, and returns DataFrames.
    """
    reader = MarkdownTableTextLoader(text=markdown_content)
    table_groups = defaultdict(list)

    for table in reader.load():
        headers = tuple(table.headers)
        table_groups[headers].extend(table.rows)

    # Get header mappings
    header_mapping = map_headers_to_standard(list(table_groups.keys()))

    # Convert tables into DataFrames with standardized headers
    dataframes = {}
    dataframes = {headers: pd.DataFrame(rows, columns=headers) for headers, rows in table_groups.items()}
    for headers, rows in table_groups.items():
        # Map headers to standard schema
        standardized_headers = [header_mapping.get(h, h) for h in headers]
        
        df = pd.DataFrame(rows, columns=standardized_headers)
        dataframes[tuple(standardized_headers)] = df

        # Print the table with standardized headers
        print(f"Table with headers {tuple(standardized_headers)}:")
        print(tabulate(df, headers='keys', tablefmt='pretty'))
    
    return dataframes


def sha256_hash(data: bytes) -> str:
    """Compute the SHA-256 hash of the given bytes."""
    hash_object = hashlib.sha256(data)
    return hash_object.hexdigest()

class KeyValueStore:
    _instance = None 
    def __new__(cls, max_size=100):
        if cls._instance is None:
            cls._instance = super(KeyValueStore, cls).__new__(cls)
            cls._instance.store = OrderedDict()
            cls._instance.max_size = max_size  # Define LRU cache size
        return cls._instance


    def set(self, key: str, value):
        """Store a value with a given key, evict least recently used if full."""
        if key in self.store:
            self.store.move_to_end(key)  # Mark as recently used
        self.store[key] = value
        if len(self.store) > self.max_size:
            self.store.popitem(last=False)  # Evict least recently used item

    def get(self, key: str):
        """Retrieve the value for a given key, move it to the end (most recently used)."""
        if key in self.store:
            self.store.move_to_end(key)  # Mark as recently used
            return self.store[key]
        return None

    def delete(self, key: str):
        """Remove a key-value pair if the key exists."""
        if key in self.store:
            del self.store[key]

    def get_all(self):
        """Return all key-value pairs."""
        return self.store.copy()
    
    def clear(self):
        """Clear the entire store."""
        self.store.clear()
    
    def len(self):
        return len(self.store)


def get_analyzer_prompt():    
    prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a expert in reading markdown tables and analyzing it.",
        ),
        ("human", "{input}"),
    ])
    
    return prompt

def get_analyzer_input(markdown_table_data: str):
    input = f"""Here is a transactions data in the form of a markdown table.
    {markdown_table_data}

    For this markdown table, give me a breakdown of the credit and debit expenses, what category they belong to, and a brief analysis of the trends you see from this transactions table. 

    Return the response in JSON format with the key "result".

    Example categories might include: 
    - 'food and dining'
    - 'lifestyle'
    - 'zelle payments'
    - 'monthly fee'
    - 'paycheck'
    - 'health and wellness'
    - 'entertainment'
    - 'travel and transportation'
    - 'education and tuition'
    - 'housing and rent'
    - 'subscriptions'
    - 'utilities'
    - 'savings and investments'
    - 'shopping'
    - 'insurance'
    - 'credit card payments'


    ### Expected JSON Output:
    {{
    "result": {{
        "credits": [
        {{
            "category": "Income (Treasury Deposits)",
            "description": "Electronic Deposit From 36 TREAS 310",
            "total_amount": 29937.00,
            "transaction_count": 8,
            "notes": "Recurring deposits throughout October, peaking on Oct 4 ($11,911.98) and Oct 20 ($11,414.48)"
        }},
        {{
            "category": "Income (CGS Administrator)",
            "description": "Electronic Deposit From CGS ADMINISTATOR",
            "total_amount": 66938.03,
            "transaction_count": 9,
            "notes": "Largest deposit on Oct 4 ($11,911.98) with multiple mid-sized deposits weekly"
        }}
        ],
        "debits": [
        {{
            "category": "Food & Dining",
            "description": "VISA purchases at Panera Bread, Chick-Fil-A",
            "total_amount": 14.02,
            "transaction_count": 2
        }},
        {{
            "category": "Government Fees",
            "description": "MO SEC OF STATE payment",
            "total_amount": 51.25,
            "transaction_count": 1
        }},
        {{
            "category": "Education/Career",
            "description": "FredPryor Career Services",
            "total_amount": 149.00,
            "transaction_count": 1
        }},
        {{
            "category": "Home Maintenance",
            "description": "Plumbing services",
            "total_amount": 372.00,
            "transaction_count": 1
        }},
        {{
            "category": "Internal Transfers",
            "description": "Account transfers (145574108240/145570459670)",
            "total_amount": 45476.00,
            "transaction_count": 5,
            "notes": "Major transfers on Oct 12 ($20k total) and Oct 25 ($18,476 total)"
        }},
        {{
            "category": "Bank Fees",
            "description": "Service charges/withdrawals",
            "total_amount": 8057.45,
            "transaction_count": 6,
            "notes": "Includes $7,514.68 withdrawal from PHILA INS CO on Oct 16"
        }}
        ],
        "trends": {{
        "income_pattern": "Irregular deposit amounts with multiple sources (Treasury + CGS)",
        "spending_pattern": "Large institutional transfers dominate debits (83% of total outflows)",
        "notable_observation": "Significant mid-month activity: Oct 12-16 saw $20k in transfers + $7.5k insurance withdrawal",
        "cash_flow_alert": "High-value transfers (total $45k+) suggest active fund management between accounts",
        "recurring_expenses": "Phone bill ($308.48), insurance payments, and service charges",
        "credit_debit_ratio": {{
            "total_credits": 2018.17,
            "total_debits": 1574.19,
            "ratio": 1.28
        }}
        }}
    }}
    }}
    """
    
    return input


def process_analyzer_response(message):
    raw_response = message.content.strip()

    # Remove triple backticks and the `json` label if present
    if raw_response.startswith("```json"):
        raw_response = raw_response[7:]  # Remove "```json"
    if raw_response.endswith("```"):
        raw_response = raw_response[:-3]  # Remove trailing "```"
    try:
        response_json = json.loads(raw_response)  # Ensure it's parsed as JSON
        return response_json
    except json.JSONDecodeError:
        print("Error: Response is not valid JSON")
        return None