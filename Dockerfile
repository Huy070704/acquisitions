# ---------------------------------------------------
# 1. Base stage: Môi trường chung cho tất cả stage
# ---------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app

# libc6-compat: cần cho native binaries (bcrypt) trên Alpine Linux
# apk là package manager của Alpine Linux (giống apt trên Ubuntu).
# add là cài package.
# --no-cache là không lưu cache sau khi cài.
# libc6-compat là gói tương thích giúp Alpine Linux chạy được nhiều chương trình và thư viện vốn được biên dịch cho glibc trên Ubuntu/Debian.
RUN apk add --no-cache libc6-compat

# Phân quyền /app cho user node — không chạy app với quyền root
# Nó đổi chủ sở hữu của thư mục /app thành user node.
RUN chown -R node:node /app

# ---------------------------------------------------
# 2. Development stage: Hot-reload + tự động migration
# ---------------------------------------------------
# Khai báo một Stage (giai đoạn build) mới tên là development, kế thừa (nhân bản) toàn bộ môi trường từ Stage base ở phía trên.
FROM base AS development
ENV NODE_ENV=development

# Tương đương việc chuyển sang user node trong Linux thay vì chạy với quyền root.
USER node

# Copy package files trước để tận dụng Docker layer cache
# Nếu package.json không đổi → layer này được cache, không cài lại
COPY --chown=node:node package*.json ./
RUN npm install

# Copy toàn bộ file/thư mục nguồn từ máy thật (host) vào thư mục làm việc /app của Container, cấp quyền sở hữu cho user node.
COPY --chown=node:node . .

EXPOSE 3000

# Thứ tự: đợi DB → generate migration → chạy migration → start dev
# Lệnh mặc định sẽ thực thi khi container được khởi động (docker run hoặc docker-compose up).
CMD ["sh", "-c", "node scripts/wait-db.js && npm run db:generate && npm run db:migrate && npm run dev"]

# ---------------------------------------------------
# 3. Deps stage: Chỉ cài production dependencies (không có devDeps)
# Tách riêng để production stage không phải chạy npm install
# ---------------------------------------------------
FROM base AS deps

USER node

# Copy duy nhất 2 file package.json và package-lock.json vào container.
COPY --chown=node:node package*.json ./

# npm ci: cài đúng version từ package.json va packags-lock.json, ko giong npm install chi cai version mới nhất. Nó sạch hơn npm install, xóa node_modules cũ trước khi cài.
# --only=production: bỏ qua devDependencies (eslint, drizzle-kit, prettier...)
RUN npm ci --only=production

# ---------------------------------------------------
# 4. Production stage: Image gọn, bảo mật, không devtools
# ---------------------------------------------------
FROM base AS production
ENV NODE_ENV=production

USER node

# Lấy node_modules đã cài sạch từ deps stage (không cần npm install lại)
# Hãy sang Stage deps vát đúng thư mục node_modules (đã được lọc sạch gói thừa) bê sang Stage production này.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy source code
# Copy toàn bộ mã nguồn của dự án (src/, config/, package.json...) vào container.
# Lưu ý: Các file rác như .git, node_modules ở máy local, file .env sẽ bị bỏ qua nhờ file .dockerignore.
COPY --chown=node:node . .

EXPOSE 3000

# Healthcheck: Docker tự kiểm tra app còn sống không mỗi 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
