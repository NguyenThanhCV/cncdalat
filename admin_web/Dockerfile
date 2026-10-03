FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .env.example .env
COPY . .

ARG VITE_API_URL=/api
ARG VITE_STOREFRONT_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STOREFRONT_URL=${VITE_STOREFRONT_URL}

RUN npm run build

FROM nginx:alpine
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
