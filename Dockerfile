# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application (if there's a build step, e.g., for a frontend framework)

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD [ "npm", "start" ]