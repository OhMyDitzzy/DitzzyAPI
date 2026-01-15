FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

RUN npm install

COPY src ./src
COPY _build/ ./_build
COPY components.json ./

RUN npx tsx _build/script.ts

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "dist/index.cjs"]