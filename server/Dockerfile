FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN chmod +x docker-entrypoint.sh

ENV PORT=4000
ENV DB_PATH=/app/data/presight.db

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
