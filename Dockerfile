FROM node:22-alpine
WORKDIR /app
COPY . /app/package-*.json
COPY . .
RUN npm install
EXPOSE  ${CUSTOMER_SERVICE_PORT}
CMD ["node","index.js"]