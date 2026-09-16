FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including build tools like tsc)
COPY package*.json ./
RUN npm install

# Copy application source code and compile TypeScript
COPY . .
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start compiled server
CMD ["node", "dist/server.js"]
