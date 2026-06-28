FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Just run the npm script directly
# CMD ["npm", "run", "dev"]
CMD ["npx", "vite", "--host"]
