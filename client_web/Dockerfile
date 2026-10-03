FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
# This legacy dependency tree includes recompose, whose peer range stops at
# React 16 even though the application runs React 18.
RUN npm ci --legacy-peer-deps

COPY .env.example .env
COPY . .

ARG REACT_APP_API_URL=/api
ARG REACT_APP_SITE_URL=http://localhost:3000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_SITE_URL=${REACT_APP_SITE_URL}
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV GENERATE_SOURCEMAP=false

RUN npm run build

FROM nginx:alpine
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
