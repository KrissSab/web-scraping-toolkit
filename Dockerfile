FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/src/app/node_modules/.cache/playwright
RUN npx playwright install chromium --with-deps
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start:dev"]