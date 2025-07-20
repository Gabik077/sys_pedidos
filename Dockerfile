# Etapa base: instalar todas las dependencias y copiar código
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "production" ]; then npm install; else npm install; fi

COPY . .

# Etapa build: solo para producción, hace build
FROM base AS build
RUN npm run build

# Etapa producción: solo copia dist y prod deps
FROM node:20-slim AS production
RUN useradd -m appuser
WORKDIR /app

# Copiar solo lo necesario desde build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

USER appuser
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
