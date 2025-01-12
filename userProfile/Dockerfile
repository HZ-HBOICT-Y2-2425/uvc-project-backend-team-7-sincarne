# Use Node.js base image
FROM node:22.11.0

# Set the working directory
WORKDIR /usr/src/userProfile

# Copy all necessary files
COPY package*.json tsconfig.json .env ./

# Install dependencies
RUN npm install 

# Copy the entire application source code
COPY . .

# Expose the port
EXPOSE 3011

# Start the microservice
CMD ["npm", "run", "dev"]