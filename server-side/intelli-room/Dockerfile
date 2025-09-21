# Stage 1: The Builder
FROM node:22 AS builder

WORKDIR /app

# Copy package.json and install dependencies
# We need dev dependencies for the 'build' step
COPY package*.json ./
RUN npm install

# Copy all application code
COPY . .

# Run the build command to generate the 'dist' directory
RUN npm run build

# Stage 2: The Production Image
# Use a lean base image for the final production image
FROM node:22-alpine AS production

WORKDIR /app

# Copy only the necessary files from the builder stage
# This includes package.json and the compiled 'dist' directory
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

COPY .env .env

# Install production dependencies only
RUN npm install --omit=dev

# Expose the port
EXPOSE 9000

# Start the application using the compiled JavaScript
CMD ["node", "dist/main.js"]