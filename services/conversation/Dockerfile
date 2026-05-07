FROM node:20-alpine
WORKDIR /app
COPY services/conversation/package.json services/conversation/package-lock.json ./
RUN npm ci --production
COPY services/conversation/src ./src
COPY services/conversation/migrate.js ./migrate.js
COPY data/postgres/migrations ./migrations/
EXPOSE 3000
CMD ["sh", "-c", "node migrate.js && node src/index.js"]
