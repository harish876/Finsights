# AI-Powered Insights for Bank Statements

This project efficiently analyzes bank statements using **FastAPI** and **Llama Parse**. It extracts transaction details, categorizes expenses, and generates financial insights. Made it as part of a hiring challenge for Cascading AI.

## Demo
Watch the demo video: [YouTube Link](https://youtu.be/lyeidC1sXhk)

## Features

- **Bank Statement Parsing**: Extracts transaction details, balances, and other relevant data.
- **Insight Generation**: Provides expense trends, category-wise breakdowns, and income tracking.
- **FastAPI Backend**: A lightweight, high-performance API for handling requests.
- **Secure Document Handling**: Ensures data privacy and secure processing.
- **Extensible Design**: Easily add new insights or support for additional formats.

## Installation

### Prerequisites

- Python 3.9+
- pip
- Virtual environment (optional but recommended)

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/harish876/Finsights
   cd Finsights
   ```

2. Create and activate a virtual environment:
   ```sh
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\\Scripts\\activate`
   ```

3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Running the Application

## Backend: 
Start the FastAPI server:
```sh
fastapi dev
```

Once running, access the API documentation at:
```
http://127.0.0.1:8000/docs
```

## Frontend:
Start the NextJS Server (Make sure to use node version >=18):
```sh
npm run dev
```

## Usage

1. Upload a bank statement via the API.
2. The backend parses transactions and extracts details.
3. Retrieve insights such as expense categorization and trends.

## API Endpoints

| Method | Endpoint          | Description |
|--------|------------------|-------------|
| POST   | `/api/v1/submit`        | Upload/Submit a bank statement |
| GET    | `/api/v1/get_insights`      | Get financial insights |
| GET    | `/api/v1/get_tables`    | View Tabular Data in the Bank Statement as a data table |

## Configuration

- Modify `config.py` to customize parsing settings.
- Logging and debugging can be adjusted in `settings.py`.

## Todo

- Make this better by dockerizing it and improving the code structure.
- Working on this project to make it better. This is a very very rough prototype

## License

MIT License. See `LICENSE` file for details.
