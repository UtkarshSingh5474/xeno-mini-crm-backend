
# Mini CRM Consumer Server

This repository contains the consumer server for the Mini CRM application. The consumer server is built using Node.js and handles message consumption for data ingestion and delivery receipt processing.

## Tech Stack

- **Backend Framework:** Node.js
- **Database:** MongoDB
- **Message Broker:** RabbitMQ (hosted on CloudAMQP)
- **Hosting:** Railway

## Features

- **Data Ingestion Consumer:** Consumes messages for data ingestion into the database.
- **Delivery Receipts Consumer:** Processes delivery receipt messages and updates the database (communication_log).


## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB
- CloudAMQP account for RabbitMQ

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/consumer-server.git
    cd consumer-server
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

1. Start the consumer server:
    ```bash
    npm start
    # or
    node server.js
    ```

2. The consumer server will be running and listening for messages from RabbitMQ.

