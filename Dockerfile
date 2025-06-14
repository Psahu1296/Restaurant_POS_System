# Stage 1: Build the React Frontend Application
FROM node:20-alpine AS frontend_builder

# Set working directory for the frontend build
WORKDIR /app/frontend

# Copy frontend's package.json and install dependencies
# We copy from the root of the build context (which is the project root)
COPY pos-frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY pos-frontend .

# Build the React frontend for production
# This creates the 'dist/client' folder with your static files
# Make sure 'npm run build:client' is defined in pos-frontend/package.json
RUN npm run build:client

# Stage 2: Build the Node.js Backend Application and serve Frontend
FROM node:20-alpine

# Set working directory for the combined app
WORKDIR /app

# Create backend directory and copy backend files
RUN mkdir -p /app/pos-backend

# Copy backend's package.json and install dependencies
# We copy to /app/pos-backend to maintain the structure relative to app.js
COPY pos-backend/package*.json ./pos-backend/
RUN npm -C ./pos-backend install # Install dependencies in the correct context

# Copy backend source code (app.js, controllers, models, routes, config, middleware, .env)
COPY pos-backend/. ./pos-backend/
# Note: This copies everything. Ensure .env is copied.

# Copy the built frontend static files from the frontend_builder stage
# These will be located at /app/pos-frontend/dist/client inside the container
COPY --from=frontend_builder /app/frontend/dist/client ./pos-frontend/dist/client

# Set the entry point for the application to be your backend's app.js
# This assumes your app.js is in /app/pos-backend
WORKDIR /app/pos-backend

# Expose the port your Node.js app listens on (from your app.js: config.port or process.env.PORT)
# Your app.js listens on `PORT`, which is `config.port`. Let's assume 5000 from previous context.
EXPOSE 5000

# Command to run your Node.js application
CMD ["node", "app.js"]