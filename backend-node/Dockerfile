FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS final
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public/uploads/images/stories public/uploads/documents/stories \
             public/uploads/documents/grants public/uploads/documents/resources \
             public/uploads/images/settings public/uploads/images/cases \
             public/uploads/images/team

EXPOSE 8000
CMD ["node", "server.js"]
