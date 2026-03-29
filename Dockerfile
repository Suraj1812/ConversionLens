FROM node:22-alpine AS base

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src

RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD ["npm", "start"]
