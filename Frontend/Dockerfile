FROM node:18-alpine AS build
WORKDIR /app

# Copy package metadata and install deps
COPY package*.json ./
# Changed from npm ci to npm install for better network resilience
RUN npm install

# Copy source and build
COPY . .
RUN npm run build --prod   # produces dist/<project-name>

# === 2️⃣ Slim runtime image with Nginx ========================
FROM nginx:alpine

# Copy custom Nginx config (server block only!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# This part seems to be for environment variable substitution.
# It's good, but ensure your nginx.conf and entrypoint.sh are correct.
RUN apk update && apk add gettext
COPY ./entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Copy the built Angular files from the build stage
# IMPORTANT: Make sure 'auth-service' is the correct output folder name in your 'dist' directory.
# Check your angular.json file for the "outputPath".
COPY --from=build /app/dist/auth-service /usr/share/nginx/html

# (optional) health-check
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
