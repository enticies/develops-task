# News Article Agent

Link: https://develops-task.onrender.com/

A Node.js-based query-response application that integrates with a large language model (LLM) to create a Retrieval-Augmented Generation (RAG) system using a vector database. The application ingests news article links from Kafka, extracts and cleans the content, and provides answers to user queries.

## Features

- Ingests news article links from Kafka
- Extracts and cleans article content using web scraping and LLM
- Stores articles in a vector database for efficient retrieval
- Provides a REST API for querying the knowledge base
- Answers questions about specific articles by URL

## Optimization Techniques

### Quality Improvements
- Chunk size optimization: Adjusting text chunk size to improve context relevance

### Cost Optimization
- Caching: Store frequent queries and their responses to reduce API calls
- Tiered model approach: Use smaller models for preprocessing and larger models for final generation
- Batching requests: Combining multiple operations in single API calls
- Query preprocessing: Filter and optimize user queries before sending to LLM
- Token optimization: Compress prompts and trim unnecessary content

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (optional, for containerized deployment)
- OpenAI API key
- Pinecone account and API key

