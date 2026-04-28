# Projeto de Cotacao e Carteira de Criptomoedas

MVP full stack em Java + React para registrar compras de criptomoedas, calcular preco medio, acompanhar posicoes, criar alertas de preco e gerar uma previsao simples baseada no historico salvo.

## Stack

- Java 21 com Spring Boot
- React + Vite + TypeScript
- PostgreSQL
- Docker Compose
- CoinGecko API para cotacoes
- WhatsApp em modo simulado via log no backend

## Como rodar com Docker

Copie o arquivo de ambiente e suba os containers:

```bash
cp .env.example .env
docker compose up --build
```

Depois acesse:

- Frontend: http://localhost:5173
- Backend: http://localhost:8081
- Health check: http://localhost:8081/actuator/health
- Swagger UI: http://localhost:8081/swagger-ui.html

## Endpoints principais

- `GET /api/portfolio/positions`: lista posicoes consolidadas.
- `GET /api/portfolio/purchases`: lista compras.
- `POST /api/portfolio/purchases`: registra compra.
- `GET /api/alerts`: lista alertas.
- `POST /api/alerts`: cria alerta.
- `PATCH /api/alerts/{id}/status/{status}`: altera status para `ACTIVE`, `DISABLED` ou `TRIGGERED`.
- `DELETE /api/alerts/{id}`: remove alerta.
- `GET /api/predictions?coingeckoId=bitcoin&currency=USD`: gera previsao simples.

## Exemplo de compra

```json
{
  "coingeckoId": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "currency": "USD",
  "quantity": "0.01",
  "unitPrice": "65000",
  "fees": "2.50",
  "purchaseDate": "2026-04-27",
  "note": "Compra inicial"
}
```

## Exemplo de alerta

```json
{
  "coingeckoId": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "currency": "USD",
  "targetPrice": "70000",
  "direction": "ABOVE",
  "whatsappNumber": "+5500000000000"
}
```

## Observacoes

- O envio por WhatsApp ainda e simulado no log da aplicacao. A interface `NotificationService` permite trocar por Twilio ou Meta WhatsApp Cloud API.
- A previsao e experimental e usa tendencia linear simples com as ultimas amostras salvas. Ela nao deve ser considerada recomendacao financeira.
- O MVP trata apenas compras. Vendas e transferencias podem ser adicionadas em uma proxima etapa.
