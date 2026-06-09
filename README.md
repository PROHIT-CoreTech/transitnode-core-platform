# TransitNode ERP - Core Platform

TransitNode ERP is an enterprise-grade, multi-tenant logistics and fleet management ecosystem engineered to centralize and automate end-to-end supply chain operations.

## Architecture

This project is structured as a decoupled monorepo:

### 1. Frontend (`/frontend`)
The client-side application built with React, React Router, and Tailwind CSS. It provides role-based dashboards for different users within the logistics ecosystem.
- **Receptionist**: Intake forms, weight matrices, and shipment list.
- **Accountant**: Pending invoice queue and billing modifiers.
- **Admin**: Live fleet map tracking and yearly rate editor.
- **Public Tracker**: Secure single shipment view for receivers.

### 2. Backend (`/backend`)
The core infrastructure built with Node.js, Express, and Socket.io. It handles data persistence, real-time tracking, and API endpoints.
- **Data Layer**: PostgreSQL (relational data) and MongoDB/Redis (time-series and live location logs).
- **Controllers**: Authentication, shipment intake, and dynamic invoice generation.
- **Hardware Integration**: Native Node.js TCP network port listener for telemetry packet parsing.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- MongoDB

### Installation

1. Install dependencies for both the frontend and backend:
   ```bash
   npm install --prefix frontend
   npm install --prefix backend
   ```

2. Set up environment variables:
   - Create a `.env` file in the `/backend` directory to store your database credentials and JWT secrets.
   - Create a `.env` file in the `/frontend` directory for any public-facing API keys (e.g., Google Maps).

3. Start the development servers:
   - **Frontend**:
     ```bash
     cd frontend && npm start
     ```
   - **Backend**:
     ```bash
     cd backend && npm run dev
     ```

## Deployment
- **Frontend**: Optimized for deployment on platforms like Vercel or Netlify.
- **Backend**: Pre-configured with an `ecosystem.config.js` file for seamless production deployment using PM2 on AWS EC2 or any VPS.
