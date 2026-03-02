# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Argument for the API URL, to be passed during docker build
ARG VITE_API_URL

# Set environment variable for the build process
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the static files
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]