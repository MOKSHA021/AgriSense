FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 5000

# Use standard node instead of nodemon for production
CMD ["node", "server.js"]
