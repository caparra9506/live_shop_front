FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN pnpm build

# Imagen de producción
FROM node:20-alpine

# Instalar nginx
RUN apk add --no-cache nginx

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar dependencias y archivos construidos
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorio para nginx pid
RUN mkdir -p /run/nginx

EXPOSE 80

# Script simple para iniciar ambos servicios
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'node ./dist/server/entry.mjs &' >> /start.sh && \
    echo 'sleep 2' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
