FROM node:10.3.0-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install --production --silent -g @hayalasalah/hayalasalah@1.0.3
COPY . .
EXPOSE 3000
CMD has-server