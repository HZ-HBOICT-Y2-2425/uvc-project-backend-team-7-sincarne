FROM node:22.11.0

# Set the working directory
WORKDIR /usr/src/apigateway

# Copy all necessary files
COPY package*.json tsconfig.json .env ./

# Install dependencies
RUN npm install

# Copy the entire application source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]