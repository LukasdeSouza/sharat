# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies, including dev dependencies to run migrations
RUN npm install

# Copy prisma schema to be able to run migrations
# The prisma client is generated during npm install
COPY prisma ./prisma/

# Copy the rest of the application source code
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# The command to run on container startup will be provided by docker-compose
# to ensure migrations run before the app starts.
CMD ["npm", "start"]