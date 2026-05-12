# Use a lightweight Node.js base image for development
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer cache.
COPY package*.json ./

# Install dependencies.
# This will be a fast, cached step on subsequent builds unless dependencies change.
RUN npm install

# Expose the port where the development server will run
EXPOSE 5173

# Command to start the application with a watcher for development
# This assumes your package.json has a "dev" script that starts your dev server.
# The volume mounted in docker-compose.yml will handle code synchronization.
CMD ["sh", "-c", "npm run dev"]
