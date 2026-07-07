FROM node:20-alpine3.22 AS build

WORKDIR /app

ARG API_URL=http://localhost:8081/api

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN printf "export const environment = {\n  production: true,\n  apiUrl: '%s',\n};\n" "$API_URL" > src/environments/environment.prod.ts \
  && npm run build -- --configuration production

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/skill-swap-v2/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
