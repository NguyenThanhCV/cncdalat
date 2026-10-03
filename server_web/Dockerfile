FROM node:22-alpine
ARG PORT=5001
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE ${PORT}
CMD ["node","server.js"]
