# Mini CRM Backend

This repository contains the backend services for the Mini CRM application, including the API backend and the consumer server. Both services are built using Node.js and utilize MongoDB for data storage and RabbitMQ (hosted on CloudAMQP) for message brokering.

## Tech Stack

- **Backend Framework:** Node.js
- **Database:** MongoDB
- **Message Broker:** RabbitMQ (hosted on CloudAMQP)
- **Hosting:** Railway

## Projects

### 1. API Backend

The API backend provides various services for data ingestion, campaign management, vendor services, and delivery receipt processing.

#### Features

- **Data Ingestion:** APIs to ingest data into customer and orders database.
- **Campaign Management:** APIs to create and manage campaigns.
- **Vendor Service**: Sends personalised message for each customer.
- **Delivery Receipts:** Batch processing and handling delivery receipts via a pub-sub model.

For more details, please refer to the [README](api-backend/README.md) in the `api-backend` folder.

### 2. Consumer Server

The consumer server handles message consumption for data ingestion and delivery receipt processing.

#### Features

- **Data Ingestion Consumer:** Consumes messages for data ingestion into the database.
- **Delivery Receipts Consumer:** Processes delivery receipt messages and updates the database.

For more details, please refer to the [README](consumer-server/README.md) in the `consumer-server` folder.

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
    ```

2. Follow the instructions in the respective folders (`api-backend` and `consumer-server`) to set up and run each service.
