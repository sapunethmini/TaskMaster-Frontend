# FROM node:18-alpine AS build

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# RUN npm run build --prod

# FROM nginx:alpine

# COPY --from=build /app/dist/auth-service /usr/share/nginx/html

# === 1️⃣  Build the Angular app ================================
FROM node:18-alpine AS build
WORKDIR /app

# Copy package metadata and install deps
COPY package*.json ./
RUN npm ci                 # or: npm install

# Copy source and build
COPY . .
RUN npm run build --prod   # produces dist/<project-name>

# === 2️⃣  Slim runtime image with Nginx ========================
FROM nginx:alpine

# Copy custom Nginx config (server block only!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular files
COPY --from=build /app/dist/auth-service /usr/share/nginx/html

# (optional) health-check
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
