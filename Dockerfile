# ---- 1. Estágio de Build ----
    FROM node:18-alpine AS development

    WORKDIR /usr/src/app
    
    # Copia package.json e pnpm-lock.yaml
    COPY package.json pnpm-lock.yaml ./
    
    # Define o diretório de store do pnpm (para evitar conflitos)
    ENV PNPM_HOME=/usr/src/app/.pnpm-store
    ENV PATH=$PNPM_HOME:$PATH
    RUN npm install -g pnpm && pnpm config set store-dir .pnpm-store
    
    # Instala dependências
    RUN pnpm install
    
    # Copia o restante da aplicação
    COPY . .
    
    # ---- 2. Estágio de Produção ----
    FROM node:18-alpine AS production
    
    WORKDIR /usr/src/app
    
    # Define store (por precaução, caso queira rodar pnpm em prod também)
    ENV PNPM_HOME=/usr/src/app/.pnpm-store
    ENV PATH=$PNPM_HOME:$PATH
    
    # Copia apenas o necessário
    COPY --from=development /usr/src/app/node_modules ./node_modules
    COPY --from=development /usr/src/app/package*.json ./
    COPY --from=development /usr/src/app/dist ./dist
    
    EXPOSE 3000
    
    CMD ["node", "dist/main"]
    