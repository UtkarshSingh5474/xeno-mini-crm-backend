# Mini CRM API Backend

This repository contains the API backend for the Mini CRM application. The backend is built using Node.js, and it provides various services for data ingestion, campaign management, and delivery receipt processing.

## Tech Stack

- **Backend Framework:** Node.js
- **Database:** MongoDB
- **Message Broker:** RabbitMQ (hosted on CloudAMQP)
- **Hosting:** Railway

## Features

- **Data Ingestion:** APIs to ingest data into customer and orders database via queue.
- **Campaign Management:** APIs to create and manage campaigns.
- **Vendor Service**: Sends personalised campaigns messages to customers.
- **Delivery Receipts:** Batch processing and handling delivery receipts via a pub-sub model.


## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB
- CloudAMQP account for RabbitMQ

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/UtkarshSingh5474/xeno-mini-crm-backend.git
    cd xeno-mini-crm-backend
    cd api-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables in `.env` file:
    ```plaintext
    MONGODB_URI=your-mongodb-uri
    RABBITMQ_URI=your-cloudamqp-uri
    ```

### Running the Application

1. Start the server:
    ```bash
    node app.js
    ```

2. The server will be running on `http://localhost:5000`.

