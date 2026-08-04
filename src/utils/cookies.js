export const cookies = {
  /**
   * Cấu hình tùy chọn bảo mật chuẩn cho Cookie
   * Bọc trong ngoặc đơn () để tự động return về Object
   */
  getOptions: () => ({
    httpOnly: true, // JavaScript phía trình duyệt KHÔNG được đọc cookie. (Chống XSS)
    secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS (not http) khi ở môi trường Production
    sameSite: 'strict', // Ngăn chặn gửi cookie trong các truy vấn cross-site (Chống CSRF)
    maxAge: 15 * 60 * 1000, // Thời gian sống của cookie: 15 phút (tính bằng millisecond)
  }),

  //   Nếu secure: true: Trình duyệt CHỈ gửi Cookie này nếu kết nối là HTTPS (được mã hóa). Nếu chạy web qua http:// thường, trình duyệt sẽ chặn và không lưu/gửi Cookie.
  //   Nếu secure: false: Trình duyệt cho phép gửi Cookie qua cả HTTP và HTTPS.
  /**
   * Ghi Cookie vào Response trả về cho client
   */
  set: (res, name, value, options = {}) => {
    res.cookie(name, value, {
      ...cookies.getOptions(),
      ...options,
    });
  },

  /**
   * Xóa Cookie khỏi trình duyệt client (dùng cho chức năng Sign Out)
   */
  clear: (res, name, options = {}) => {
    res.clearCookie(name, {
      ...cookies.getOptions(),
      ...options,
    });
  },

  /**
   * Lấy giá trị của một Cookie cụ thể từ Request gửi lên
   */
  get: (req, name) => {
    return req.cookies?.[name];
  },
};
