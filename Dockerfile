FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:latest
WORKDIR /pb
ARG PB_VERSION=0.37.4
RUN apk add --no-cache unzip wget \
    && wget -q -O pocketbase.zip \
        https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase.zip \
    && rm pocketbase.zip \
    && apk del unzip wget
COPY --from=builder /app/dist ./pb_public
COPY pb_hooks ./pb_hooks
VOLUME /pb/pb_data
EXPOSE 8090
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
