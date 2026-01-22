# English Learning App (Scaffold)

## Requirements

- Node.js 18+
- MongoDB (local hoặc MongoDB Atlas)

## Setup

1) Tạo file env cho backend:

- Copy `server/env.sample` thành `server/.env`

2) Cài dependencies:

```bash
npm run install:all
```

3) Chạy backend:

```bash
npm run dev:server
```

4) Chạy frontend:

```bash
npm run dev:client
```

## Default Admin

Khi chạy `server`, bạn có thể seed admin bằng script (xem `server/package.json`).
