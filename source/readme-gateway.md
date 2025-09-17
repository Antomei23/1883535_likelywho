`.
├─ frontend/                    # la tua app Next.js già esistente
│  └─ .env.local               # (nuovo) FE parla solo col gateway via BFF/route handlers
├─ gateway/
│  ├─ traefik.yaml             # config statica traefik
│  └─ dynamic/
│     ├─ middlewares.yaml      # CORS, rate-limit, security headers
│     └─ tls.yaml              # (opz) self-signed per dev https
├─ .env                         # variabili docker compose (porte, hostnames)
├─ docker-compose.yml           # gateway + microservizi + frontend
└─ README-gateway.md            # istruzioni rapide`
\\
Nota: i microservizi li fai vivere in ./services/<nome-servizio>. In docker-compose.yml ho già messo i blocchi con porte e label di routing — se la cartella non esiste ancora, li crei dopo.\\
Le regole di routing sono per prefix di risorsa:

/api/v1/auth → auth-service

/api/v1/users → user-service

/api/v1/questions → question-service

/api/v1/votes → voting-service

/api/v1/notifications → notification-service

/api/v1/db → database-service

\\
------------------------------------------
# API Gateway (Traefik) – Setup

## Requisiti
- Docker & Docker Compose

## Avvio

1. Configura `.env` se vuoi cambiare porte o prefix.
2. Avvia:
   ```bash
   docker compose up --build
