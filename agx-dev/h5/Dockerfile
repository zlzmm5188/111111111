FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建原生模块所需的工具
RUN apk add --no-cache python3 make g++ autoconf automake libtool nasm zlib-dev libpng-dev

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine

# 安装 OpenSSL（用于 SSL 证书）
RUN apk add --no-cache openssl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建 SSL 证书目录
RUN mkdir -p /etc/nginx/ssl

# 如果使用 Cloudflare Origin Certificate，需要手动挂载证书文件
# 或者使用 Let's Encrypt 自动证书

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
