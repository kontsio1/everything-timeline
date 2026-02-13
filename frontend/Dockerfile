# Use official Node.js image
FROM node:23

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Expose the React dev server port
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
