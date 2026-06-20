FROM node:20-alpine

# Criar directório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências da raiz
COPY package.json package-lock.json* ./

# Instalar dependências da raiz
RUN npm install --omit=dev

# Copiar todo o código
COPY . .

# Expor porta
EXPOSE 3000

# Iniciar a aplicação
CMD ["node", "backend/src/index.js"]
