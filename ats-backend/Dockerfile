FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY interview-frontend/package*.json ./
RUN npm ci
COPY interview-frontend/ ./
RUN npm run build

FROM node:20-alpine

# Install Python and Java for code execution
RUN apk add --no-cache python3 openjdk11

WORKDIR /app

COPY ats-backend/package*.json ./
RUN npm install --omit=dev

COPY ats-backend/ ./

# Express expects frontend build at ../interview-frontend/build from /app
COPY --from=frontend-builder /frontend/build /interview-frontend/build

EXPOSE 5000

CMD ["node", "server.js"]