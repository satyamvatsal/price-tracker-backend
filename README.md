## 📈 Features

- **Real‑time price alerts** sent via Firebase Cloud Messaging on mobile.
- **RESTful endpoints**:  
  - `POST /track` – add product to tracking list  
  - `DELETE /track/:id` – remove tracking  
  - `GET /track` – list current tracking items  
  - `GET /history/:productId` – historical price data

- **WebSocket feed** – live updates on new track requests or price drops.
- **Scheduler** – automated polling every X minutes to check for price changes.
- **Type‑safe codebase** – full TypeScript on both client, server, and DB layers.
