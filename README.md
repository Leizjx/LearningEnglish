# 🎉 Learning English App

Ứng dụng học tiếng Anh toàn diện giúp người dùng cải thiện vốn từ vựng, luyện nghe và làm các bài kiểm tra (Quiz) một cách hiệu quả.

---

## 🚀 Công nghệ sử dụng

Dự án được xây dựng dựa trên mô hình Fullstack Hiện đại:

### Frontend
- **React.js (v18)**: Thư viện chính xây dựng giao diện người dùng.
- **React Router (v6)**: Quản lý điều hướng và định tuyến ứng dụng.
- **Axios**: Quản lý các yêu cầu HTTP (API calls) với cơ chế tự động retry và xử lý timeout cho Render.
- **Tailwind CSS**: Framework CSS giúp thiết kế giao diện nhanh và hiện đại.
- **Lucide React**: Bộ icon đẹp mắt và nhẹ nhàng.

### Backend
- **Node.js & Express.js**: Nền tảng server-side mạnh mẽ và linh hoạt.
- **MySQL (Filess.io)**: Hệ quản trị cơ sở dữ liệu quan hệ, được lưu trữ trên Filess.io để đảm bảo miễn phí và ổn định.
- **JSON Web Token (JWT)**: Cơ chế xác thực người dùng an toàn.
- **Bcrypt**: Mã hóa mật khẩu bảo mật tuyệt đối.
- **Multer**: Xử lý tải lên tệp tin (ảnh đại diện).
- **Compression**: Nén dữ liệu giúp tăng tốc độ phản hồi của API.

### Infrastructure (Hạ tầng)
- **Render**: Hosting cho Backend (với cơ chế Keep-alive tự tạo).
- **Filess.io**: Lưu trữ Database MySQL 24/7.
- **GitHub**: Quản lý mã nguồn và triển khai tự động (CI/CD).

---

## 🛠 Cấu trúc thư mục

```text
English_App/
├── frontend/          # Mã nguồn ứng dụng React
│   ├── src/           # Các component, page và logic xử lý
│   └── public/        # Tài liệu tĩnh
├── backend/           # Mã nguồn server Express
│   ├── config/        # Cấu hình Database & Env
│   ├── controllers/   # Logic xử lý API
│   ├── routes/        # Định tuyến API
│   ├── models/        # Cấu trúc dữ liệu
│   └── uploads/       # Thư mục lưu trữ ảnh
└── package.json       # Script quản lý toàn dự án
```

---

## 🚧 Cài đặt cơ bản

### 1. Phía Backend
```bash
cd backend
npm install
npm start
```

### 2. Phía Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🌟 Tính năng chính
- ✅ Đăng ký/Đăng nhập & Quản lý tài khoản.
- ✅ Quản lý bài học tiếng Anh theo chủ đề.
- ✅ Làm bài kiểm tra (Quiz) với kết quả tức thì.
- ✅ Giao diện thân thiện, tương thích với mọi thiết bị (Responsive).
- ✅ Hệ thống Admin quản lý từ vựng và người dùng.

---

*Phát triển bởi USER & Antigravity AI.*
