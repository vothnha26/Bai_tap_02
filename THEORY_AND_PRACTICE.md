# PubliCast: Lý Thuyết và Thực Hành Hệ Thống 136 Câu Hỏi Chi Tiết (Fullstack Developer)

Tài liệu này hệ thống hóa kiến thức lập trình Fullstack (Node.js, Express, React, Redis, MongoDB Mongoose) dựa trên 136 câu hỏi cốt lõi, tích hợp chi tiết phân tích và liên kết ứng dụng thực tế trong mã nguồn dự án **PubliCast**.

---

## PHẦN I: EXPRESSJS & NODE.JS CORE (CÂU 1 - 8)

### 1. ExpressJS là gì?
- **Lý thuyết:** ExpressJS là một framework tối giản (minimalist) và linh hoạt (flexible) chạy trên nền tảng Node.js, được thiết kế để xây dựng các ứng dụng web và RESTful API. Nó cung cấp các công cụ mạnh mẽ để quản lý các phương thức HTTP routing, tích hợp middleware, cấu hình response headers và xử lý biệt lệ một cách nhanh chóng mà không can thiệp sâu vào cấu trúc mã nguồn của Node.js gốc.
- **Áp dụng thực tế vào dự án PubliCast:**
  Express app đóng vai trò là "xương sống" điều phối toàn bộ yêu cầu từ Frontend.
  ```javascript
  // backend/src/app.js
  const express = require('express');
  const app = express(); // Khởi tạo ứng dụng

  // Đăng ký các module định tuyến chính
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  ```
  *Luồng hoạt động:* Khi có request HTTP gửi tới, Express sẽ nhận diện URI và phương thức (GET/POST/...) để đẩy request đó vào đúng module xử lý đã được đăng ký.

### 2. Middleware trong ExpressJS là gì?
- **Lý thuyết:** Middleware là các hàm trung gian có quyền truy cập vào các đối tượng Request (`req`), Response (`res`) và hàm điều hướng `next` trong chu kỳ request-response của ứng dụng. Middleware thực hiện các nhiệm vụ: chạy code logic, chỉnh sửa đối tượng `req` và `res`, kết thúc chu kỳ phản hồi bằng cách trả về response (ví dụ: `res.json()`), hoặc gọi hàm `next()` để chuyển quyền xử lý cho middleware tiếp theo trong chuỗi handler (Middleware Chain).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án sử dụng middleware để "lọc" dữ liệu trước khi vào Controller.
  ```javascript
  // backend/src/middlewares/validation.middleware.js
  const registerValidation = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      next(); // Chuyển tiếp tới Controller nếu dữ liệu sạch
    }
  ];
  ```
  *Luồng hoạt động:* Request -> `registerValidation` (Kiểm tra email) -> Nếu lỗi trả về 400 -> Nếu OK gọi `next()` -> `authController.register`.

### 3. Sự khác nhau giữa app.use() và app.get()?
- **Lý thuyết:**
  - `app.use()` được sử dụng để đăng ký middleware cho toàn bộ ứng dụng hoặc cho một path prefix cụ thể. Nó sẽ bắt (catch) tất cả các HTTP method (GET, POST, PUT, DELETE, PATCH,...) đi qua tiền tố đó.
  - `app.get()` là phương thức định tuyến cụ thể (routing method) chỉ lắng nghe và xử lý các request sử dụng phương thức HTTP GET khớp chính xác với URL pattern được khai báo.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```javascript
  // backend/src/app.js
  app.use(express.json()); // Áp dụng cho MỌI request (GET, POST,...)
  app.use('/api/products', productRoutes); // Áp dụng cho mọi phương thức bắt đầu bằng /api/products

  // backend/src/routes/product.routes.js
  router.get('/', productController.searchProducts); // CHỈ bắt phương thức GET tại root /
  ```
  *Giải thích:* `app.use` dùng để thiết lập hạ tầng (parser, cors) hoặc nhóm route, còn `app.get` dùng để định nghĩa hành vi lấy dữ liệu cụ thể.

### 4. RESTful API là gì?
- **Lý thuyết:** REST (Representational State Transfer) là một kiểu kiến trúc thiết kế mạng dựa trên các ràng buộc: Stateless (không lưu trạng thái client trên server), Client-Server độc lập, Cacheable, và Interface đồng nhất. RESTful API sử dụng các HTTP Method chuẩn (GET - đọc, POST - tạo mới, PUT - thay thế, PATCH - cập nhật một phần, DELETE - xóa) kết hợp với các danh từ số nhiều làm endpoint (Resource-based URL) để quản lý tài nguyên hệ thống.
- **Áp dụng thực tế vào dự án PubliCast:**
  Hệ thống quản lý sản phẩm tuân thủ chặt chẽ REST:
  ```javascript
  // backend/src/routes/product.routes.js
  router.get('/', productController.searchProducts);    // GET /api/products (Lấy danh sách)
  router.post('/', verifyAdmin, productController.createProduct); // POST /api/products (Tạo mới)
  router.delete('/:id', verifyAdmin, productController.deleteProduct); // DELETE /api/products/123 (Xóa)
  ```
  *Luồng hoạt động:* Endpoint luôn là `/products` (danh từ số nhiều), hành động được xác định qua HTTP Verb.

### 5. JWT là gì?
- **Lý thuyết:** JSON Web Token (JWT) là một tiêu chuẩn mở (RFC 7519) định nghĩa phương thức truyền thông tin an toàn giữa các bên dưới dạng đối tượng JSON. Cấu trúc JWT gồm 3 phần phân tách bởi dấu chấm: Header (thuật toán chữ ký), Payload (thông tin cần truyền tải như userId, role) và Signature (chữ ký số tạo từ Header, Payload và một khóa bí mật - Secret Key). JWT giúp thực hiện cơ chế xác thực không trạng thái (stateless authentication).
- **Áp dụng thực tế vào dự án PubliCast:**
  Class `JWTUtils` đóng gói logic tạo token:
  ```javascript
  // backend/src/utils/jwt.utils.js
  generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  }
  ```
  *Giải thích:* Khi login thành công, server đóng gói `{id, role}` vào Payload, ký bằng `ACCESS_SECRET` và trả về một chuỗi mã hóa cho client.

### 6. Nên lưu JWT ở đâu?
- **Lý thuyết:** Có hai lựa chọn phổ biến với các ưu/nhược điểm bảo mật khác nhau:
  - **HttpOnly Cookie**: Rất an toàn trước tấn công XSS vì mã JavaScript phía client không thể đọc được cookie này. Cần cấu hình flag `Secure` (chỉ gửi qua HTTPS) và `SameSite` để chống tấn công CSRF.
  - **LocalStorage/SessionStorage**: Tiện lợi khi lập trình SPA, dễ đọc và tự động đính kèm vào Header `Authorization: Bearer <token>`, nhưng dễ bị đánh cắp thông qua các lỗ hổng tiêm mã độc XSS.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án sử dụng cơ chế **Hybird**:
  - **Access Token:** Lưu LocalStorage (để Client chủ động đính kèm Header).
  - **Refresh Token:** Lưu `HttpOnly Cookie` (để tránh bị JS đánh cắp).
  ```javascript
  // frontend/src/services/api.client.js
  const api = axios.create({
    withCredentials: true, // Cho phép trình duyệt tự động gửi Refresh Token trong Cookie
  });
  ```

### 7. CORS là gì?
- **Lý thuyết:** Cross-Origin Resource Sharing (CORS) là cơ chế an toàn dựa trên HTTP header của trình duyệt, ngăn chặn một trang web ở một nguồn (origin này) truy cập vào tài nguyên của một nguồn khác (origin kia) trừ khi server của nguồn kia khai báo tường minh bằng header `Access-Control-Allow-Origin` cho phép truy cập.
- **Áp dụng thực tế vào dự án PubliCast:**
  Cấu hình trong `app.js` để cho phép Frontend (cổng 5173) gọi API Backend (cổng 3000).
  ```javascript
  // backend/src/app.js
  app.use(cors({
    origin: 'http://localhost:5173', // Chỉ cho phép domain này
    credentials: true                // Cho phép gửi kèm Cookie (quan trọng cho Refresh Token)
  }));
  ```

### 8. Event Loop trong Node.js là gì?
- **Lý thuyết:** Event Loop là cơ chế cốt lõi giúp Node.js thực thi các tác vụ I/O không chặn (non-blocking) mặc dù JavaScript chỉ chạy đơn luồng (single-threaded). Event Loop hoạt động bằng cách ủy quyền các tác vụ nặng (nhuy truy vấn DB, đọc file, network) cho nhân hệ điều hành hoặc Thread Pool của Libuv xử lý ngầm. Khi tác vụ hoàn thành, callback tương ứng sẽ được xếp vào Queue và Event Loop sẽ đẩy nó vào Call Stack để xử lý khi Call Stack rỗng.
- **Áp dụng thực tế vào dự án PubliCast:**
  Xử lý tác vụ gửi email "nặng" mà không làm treo Server:
  ```javascript
  // backend/src/worker.js
  // Worker chạy song song để xử lý queue gửi mail từ Redis
  emailQueue.process(async (job) => {
    await emailService.sendMail(job.data);
  });
  ```
  *Luồng hoạt động:* Client gọi API đăng ký -> Backend đẩy yêu cầu gửi mail vào Redis -> Event Loop tiếp tục xử lý các request khác -> Worker (Libuv thread) xử lý gửi mail ngầm.

---

## PHẦN II: REACTJS & FRONTEND ARCHITECTURE (CÂU 9 - 23)

### 9. ReactJS là gì?
- **Lý thuyết:** ReactJS là một thư viện JavaScript declarative, hiệu quả và linh hoạt dùng để xây dựng giao diện người dùng (UI) dựa trên các component. Thay vì thao tác trực tiếp với DOM thực của trình duyệt (vốn rất chậm), React quản lý trạng thái của ứng dụng và tự động cập nhật UI một cách tối ưu thông qua Virtual DOM và mô hình luồng dữ liệu một chiều (Unidirectional Data Flow).
- **Áp dụng thực tế vào dự án PubliCast:**
  Toàn bộ UI được chia nhỏ thành các Component độc lập:
  ```jsx
  // frontend/src/main.jsx
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App /> {/* Component gốc bọc toàn bộ ứng dụng */}
    </React.StrictMode>
  );
  ```
  *Giải thích:* React "chiếm quyền" điều khiển thẻ `#root` trong file HTML và tự động vẽ giao diện dựa trên mã JSX của các component.

### 10. Virtual DOM là gì?
- **Lý thuyết:** Virtual DOM (DOM ảo) là một biểu diễn gọn nhẹ của DOM thật dưới dạng các đối tượng JavaScript trong bộ nhớ. Khi dữ liệu (State/Props) của một component thay đổi, React sẽ tạo ra một cây Virtual DOM mới, so sánh nó với cây Virtual DOM cũ bằng thuật toán Diffing để tìm ra sự khác biệt nhỏ nhất (Reconciliation), và chỉ cập nhật các thay đổi cụ thể đó lên DOM vật lý của trình duyệt, tránh việc vẽ lại toàn bộ giao diện.
- **Áp dụng thực tế vào dự án PubliCast:**
  Khi cập nhật số lượng sản phẩm trong giỏ hàng:
  ```jsx
  // frontend/src/context/CartContext.jsx
  const updateQuantity = async (productId, quantity) => {
    const updatedCart = await cartService.updateQuantity(productId, quantity);
    setCart(updatedCart); // Cập nhật State
  };
  ```
  *Luồng hoạt động:* `setCart` được gọi -> React tạo Virtual DOM mới -> So sánh thấy chỉ có con số số lượng thay đổi -> Chỉ vẽ lại đúng thẻ số đó trên màn hình, giữ nguyên các phần khác.

### 11. State và Props khác nhau thế nào?
- **Lý thuyết:**
  - **State**: Là dữ liệu nội bộ của một component, được khởi tạo và quản lý hoàn toàn bên trong component đó. State có thể thay đổi theo thời gian (ví dụ thông qua `setState`) và khi state đổi, component sẽ re-render.
  - **Props (Properties)**: Là dữ liệu được truyền từ component cha xuống component con. Props là read-only (bất biến) đối với component con; component con không được phép sửa props nhận được mà chỉ có thể đọc và hiển thị.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```jsx
  // Component cha (ProductList) quản lý State
  const [products, setProducts] = useState([]);

  // Truyền dữ liệu xuống Component con (ProductCard) qua Props
  return products.map(p => <ProductCard key={p.id} product={p} />);
  ```
  *Giải thích:* `ProductCard` nhận dữ liệu `product` nhưng không thể đổi giá của nó trực tiếp. Nếu muốn đổi, cha phải đổi State `products`.

### 12. useEffect dùng để làm gì?
- **Lý thuyết:** `useEffect` là một React Hook cho phép thực thi các tác vụ có tác động bên ngoài (Side Effects) trong các functional component, ví dụ như: fetch dữ liệu từ API, thiết lập kết nối WebSocket, đăng ký sự kiện lắng nghe (event listeners), hoặc tương tác trực tiếp với DOM. Hook này nhận vào một hàm callback và một mảng phụ thuộc (dependency array) quyết định khi nào callback được chạy lại.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tự động tải giỏ hàng khi người dùng vừa mở trang web:
  ```jsx
  // frontend/src/context/CartContext.jsx
  useEffect(() => {
    fetchCart(); // Gọi API lấy giỏ hàng
  }, []); // [] có nghĩa là chỉ chạy DUY NHẤT 1 lần khi mount
  ```

### 13. Controlled Component là gì?
- **Lý thuyết:** Controlled Component là các thành phần biểu mẫu (form elements như `<input>`, `<textarea>`, `<select>`) mà giá trị (value) của chúng được kiểm soát hoàn toàn bởi React State. Mọi thay đổi về mặt giao diện của phần tử đều kích hoạt một event handler (như `onChange`) để cập nhật state, từ đó state phản hồi ngược lại thuộc tính `value` của phần tử đó.
- **Áp dụng thực tế vào dự án PubliCast:**
  Xử lý Form đăng nhập:
  ```jsx
  const [email, setEmail] = useState('');
  return (
    <input
      value={email} // Giá trị luôn khớp với State
      onChange={(e) => setEmail(e.target.value)} // Cập nhật State khi gõ
    />
  );
  ```

### 14. Redux dùng để làm gì?
- **Lý thuyết:** Redux là một thư viện quản lý trạng thái (state management) tập trung cho toàn bộ ứng dụng JavaScript. Nó hoạt động theo nguyên tắc: Một nguồn sự thật duy nhất (Single Source of Truth) lưu trong một Store toàn cục; State trong store là chỉ đọc (Read-only); Thay đổi state chỉ được thực hiện bằng cách dispatch một Action (đối tượng mô tả sự kiện) gửi đến Reducer (hàm thuần khiết tính toán state mới từ state cũ và action).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng để quản lý thông tin User sau khi đăng nhập xuyên suốt các trang:
  ```javascript
  // Store lưu { user: { name: 'Admin', role: 'ADMIN' } }
  const user = useSelector(state => state.auth.user); // Lấy data ở bất kỳ đâu
  ```
  *Giải thích:* Giúp tránh việc phải truyền Props "cồng kềnh" qua quá nhiều tầng component.

### 15. Khác nhau giữa useMemo và useCallback?
- **Lý thuyết:** Cả hai đều là hook dùng để tối ưu hóa hiệu năng bằng cách tránh tính toán lại không cần thiết:
  - `useMemo`: Ghi nhớ (cache) kết quả trả về của một hàm tính toán phức tạp. Nó chỉ tính toán lại khi một trong các dependency thay đổi.
  - `useCallback`: Ghi nhớ chính định nghĩa của một hàm (function instance). Nó tránh việc định nghĩa lại hàm đó ở mỗi lần component cha re-render, thường dùng khi truyền callback xuống component con được bọc trong `React.memo` để tránh component con bị re-render vô ích.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```jsx
  // frontend/src/context/CartContext.jsx
  const itemCount = useMemo(() => {
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart.items]); // Chỉ tính lại khi mảng items thay đổi
  ```

### 16. React Router là gì?
- **Lý thuyết:** React Router là thư viện định tuyến tiêu chuẩn cho các ứng dụng React. Nó cho phép định nghĩa các route (đường dẫn URL) tương ứng với các component khác nhau. Khi URL thay đổi, React Router sẽ chặn hành vi tải lại trang của trình duyệt và thay thế component hiển thị tương ứng trên màn hình, giúp ứng dụng hoạt động như một Single Page Application thực thụ.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```jsx
  // frontend/src/routes.jsx
  export const router = createBrowserRouter([
    { path: "/", Component: Home },
    { path: "/cart", Component: Cart },
    { path: "/admin", Component: AdminDashboard },
  ]);
  ```

### 17. Axios khác fetch thế nào?
- **Lý thuyết:**
  - `fetch` là API tích hợp sẵn của trình duyệt. Nó yêu cầu code thủ công nhiều bước: phải parse JSON thủ công qua `.json()`, không tự động ném lỗi khi gặp mã HTTP 4xx/5xx, và không hỗ trợ trực tiếp cơ chế hủy request hoặc timeout.
  - `Axios` là thư viện bên ngoài hỗ trợ tự động chuyển đổi JSON (automatic JSON transformation), hỗ trợ cấu hình interceptors (chặn request/response để xử lý tập trung), cấu hình timeout dễ dàng, và tương thích tốt trên các trình duyệt cũ hơn.
- **Áp dụng thực tế vào dự án PubliCast:**
  Sử dụng Axios để tự động giải nén dữ liệu:
  ```javascript
  // frontend/src/services/api.client.js
  api.interceptors.response.use(
    (response) => response.data, // Tự động trả về data, không cần gọi .json()
    (error) => Promise.reject(error)
  );
  ```

### 18. Authentication flow React + Express?
- **Lý thuyết:** Quy trình xác thực chuẩn:
  1. Client gửi credentials (email/password) qua HTTPS.
  2. Server xác thực và tạo cặp Access Token (sống ngắn) và Refresh Token (sống dài).
  3. Server gửi trả Access Token trong JSON response body và thiết lập Refresh Token trong HttpOnly Cookie.
  4. Client lưu Access Token vào bộ nhớ/LocalStorage và đính kèm vào Header `Authorization` cho các request tiếp theo.
  5. Khi Access Token hết hạn (nhận mã 401), Client tự động gọi API `/refresh` gửi kèm Refresh Token (từ cookie) để lấy Access Token mới.
- **Áp dụng thực tế vào dự án PubliCast:**
  Luồng Refresh Token tự động trong `api.client.js`:
  - Request API -> Nhận lỗi 401 (Hết hạn Access Token).
  - Interceptor tự động gọi `/api/auth/refresh`.
  - Nếu thành công -> Thử lại request ban đầu với Token mới.

### 19. Xử lý upload file an toàn ExpressJS?
- **Lý thuyết:** Tải file lên server tiềm ẩn nhiều nguy cơ bảo mật như mã độc hoặc làm cạn kiệt tài nguyên đĩa cứng. Để an toàn, cần: sử dụng các thư viện parser luồng dữ liệu streaming như `Multer`; giới hạn dung lượng tối đa của file; kiểm tra định dạng file (MIME type) ở cả header và phần mở rộng; đặt lại tên file ngẫu nhiên (tránh ghi đè file hệ thống); và lưu trữ file ở thư mục tĩnh không có quyền thực thi mã nguồn.
- **Áp dụng thực tế vào dự án PubliCast:**
  Mặc dù dự án đang ưu tiên API, cấu hình chuẩn cho upload ảnh sản phẩm:
  ```javascript
  const storage = multer.diskStorage({
    destination: 'uploads/products/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  });
  const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // Giới hạn 2MB
  ```

### 20. SQL Injection và XSS là gì?
- **Lý thuyết:**
  - **SQL Injection**: Tấn công bằng cách tiêm mã SQL độc hại vào các input của người dùng nhằm thay đổi truy vấn SQL gửi tới Database. Phòng chống bằng cách dùng Parameterized Queries hoặc ORM/ODM (như Mongoose/Prisma) thay vì nối chuỗi SQL thủ công.
  - **Cross-Site Scripting (XSS)**: Tấn công bằng cách tiêm mã JavaScript độc hại vào trang web để chạy trên trình duyệt của người dùng khác. Phòng chống bằng cách làm sạch dữ liệu đầu vào (escaping/sanitizing) và dùng HttpOnly Cookie để lưu token nhạy cảm.
- **Áp dụng thực tế vào dự án PubliCast:**
  - **Chống XSS:** Dùng `express-validator` để làm sạch dữ liệu:
    ```javascript
    body('name').trim().escape() // Biến <script> thành &lt;script&gt;
    ```
  - **Chống SQLi (NoSQLi):** Sử dụng Mongoose ODM để truy vấn qua Object thay vì chuỗi thuần.

### 21. SSR và CSR khác nhau?
- **Lý thuyết:**
  - **CSR (Client-Side Rendering)**: Trình duyệt tải về một file HTML rỗng và một file JS lớn. JavaScript sẽ chạy và tự tạo dựng (render) toàn bộ giao diện tại client.d Ưu điểm là chuyển trang nhanh, mượt mà sau khi tải lần đầu, nhưng nhược điểm là thời gian tải trang đầu (FCP) chậm và SEO kém.
  - **SSR (Server-Side Rendering)**: Server biên dịch mã nguồn và tạo ra file HTML chứa sẵn nội dung giao diện đầy đủ để trả về cho trình duyệt. Trình duyệt hiển thị ngay nội dung đó và tiến hành gắn sự kiện (Hydration). Ưu điểm là SEO tốt, tải trang đầu nhanh, nhưng tốn tài nguyên server hơn.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án sử dụng **CSR** với React + Vite.
  *Lợi ích:* Giảm tải cho Server Node.js, chỉ tập trung xử lý Logic/API, phần hiển thị để trình duyệt khách hàng tự lo.

### 22. Vì sao React re-render?
- **Lý thuyết:** Một component trong React sẽ thực hiện chu kỳ vẽ lại (re-render) khi xảy ra một trong các điều kiện sau:
  1. Trạng thái nội tại (`state`) của component thay đổi (thông qua hàm update state).
  2. Thuộc tính (`props`) truyền vào từ component cha thay đổi giá trị hoặc tham chiếu.
  3. Component cha của nó bị re-render (kéo theo các con cũng render lại trừ khi dùng `React.memo`).
  4. Sử dụng Context API và giá trị trong `Context.Provider` mà component đó đăng ký tiêu dùng bị thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```jsx
  // Trong CartContext.jsx
  setCart(newCart); // Khi giỏ hàng đổi, MỌI component dùng useCart() sẽ re-render
  ```

### 23. ExpressJS có nhược điểm gì?
- **Lý thuyết:** Điểm yếu lớn nhất của ExpressJS xuất phát từ chính triết lý "tối giản" của nó. Nó không ép buộc bất kỳ một kiến trúc thư mục chuẩn nào (như MVC, Onion, Clean Architecture), khiến cho các dự án lớn dễ bị lộn xộn, thiếu tính đồng nhất. Ngoài ra, việc lồng ghép quá nhiều middleware bất đồng bộ không có cơ chế quản lý lỗi tốt dễ dẫn đến rò rỉ bộ nhớ hoặc crash server nếu lập trình viên không xử lý bắt lỗi triệt để.
- **Áp dụng thực tế vào dự án PubliCast:**
  Để khắc phục, dự án áp dụng mô hình **Layered Architecture (Phân lớp)**:
  - `routes/`: Chỉ định nghĩa đường dẫn.
  - `controllers/`: Chỉ điều phối request/response.
  - `services/`: Chứa 100% logic nghiệp vụ.
  - `repositories/`: Chứa 100% logic truy vấn Database.

---

## PHẦN III: DATABASE, DEPLOYMENT & DEVOPS (CÂU 24 - 30)

### 24. MongoDB khác MySQL?
- **Lý thuyết:** MySQL là RDBMS (SQL), MongoDB là Document (NoSQL). SQL có schema cố định, NoSQL linh hoạt.
- **Áp dụng thực tế vào dự án PubliCast:**
  Sản phẩm được lưu dưới dạng Document JSON linh hoạt trong [Product.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/models/Product.js).
  *Lợi ích:* Dễ dàng thêm các thuộc tính mới cho sản phẩm mà không cần migrate database phức tạp.

### 25. Refresh Token là gì?
- **Lý thuyết:** Là token dùng để lấy Access Token mới mà không cần đăng nhập lại.
- **Áp dụng thực tế vào dự án PubliCast:**
  Triển khai trong [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js). Được lưu hash vào Redis để có thể thu hồi (revoke) ngay khi cần.

### 26. Bạn tối ưu React app như thế nào?
- **Lý thuyết:** Code splitting, memoization, lazy loading images.
- **Áp dụng thực tế vào dự án PubliCast:**
  Sử dụng `useMemo` để tránh tính toán lại tổng tiền giỏ hàng ở mỗi lần render trong `CartContext`.

### 27. Bạn deploy React + Express như thế nào?
- **Lý thuyết:** Thường dùng Docker để đóng gói môi trường.
- **Áp dụng thực tế vào dự án PubliCast:**
  Sử dụng `docker-compose.yml` để khởi tạo MongoDB, Redis và Node.js chỉ với 1 lệnh.

### 28. PM2 là gì?
- **Lý thuyết:** Process Manager cho Node.js, giúp chạy ngầm và tự động restart.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng để quản lý tiến trình server backend trên VPS, đảm bảo server luôn sống 24/7.

### 29. Khác nhau giữa Authentication và Authorization?
- **Lý thuyết:** AuthN xác thực danh tính (Bạn là ai?), AuthZ phân quyền (Bạn được làm gì?).
- **Áp dụng thực tế vào dự án PubliCast:**
  `verifyAuth` kiểm tra token (AuthN), `verifyAdmin` kiểm tra role trong token (AuthZ).

### 30. Vì sao chọn React thay Angular/Vue?
- **Lý thuyết:** Cộng đồng lớn, JSX linh hoạt, hệ sinh thái phong phú.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giúp tích hợp nhanh các thư viện UI hiện đại và các luồng state phức tạp (Cart, Auth) một cách dễ dàng.

---

## PHẦN IV: REACT STATE MANAGEMENT & HOOKS (CÂU 31 - 60)

### 31. State trong React là gì?
- **Lý thuyết:** State là dữ liệu nội tại của component, thay đổi state sẽ gây re-render.
- **Áp dụng thực tế vào dự án PubliCast:**
  Quản lý trạng thái đang tải của các button:
  ```jsx
  const [isLoading, setIsLoading] = useState(false);
  ```

### 32. Khác nhau giữa State và Props?
- **Lý thuyết:** State thuộc về component hiện tại, Props là dữ liệu nhận từ cha.
- **Áp dụng thực tế vào dự án PubliCast:**
  `ProductDetail` nhận `id` từ Props (URL params) và lưu thông tin sản phẩm vào State sau khi fetch.

### 33. useState hoạt động như thế nào?
- **Lý thuyết:** Hook trả về giá trị hiện tại và hàm cập nhật.
- **Áp dụng thực tế vào dự án PubliCast:**
  Sử dụng trong mọi form nhập liệu: `const [email, setEmail] = useState('');`.

### 34. Vì sao setState bất đồng bộ?
- **Lý thuyết:** Để thực hiện Batching, tối ưu hiệu năng render.
- **Áp dụng thực tế vào dự án PubliCast:**
  Khi cập nhật nhiều state liên tục trong hàm `onLogin`, React chỉ render lại đúng 1 lần.

### 35. Cách update state dựa trên state cũ?
- **Lý thuyết:** Dùng callback function trong hàm set: `setCount(prev => prev + 1)`.
- **Áp dụng thực tế vào dự án PubliCast:**
  ```jsx
  setCart(prev => ({ ...prev, items: [...prev.items, newItem] }));
  ```

### 36. Lifting State Up là gì?
- **Lý thuyết:** Chuyển state chung lên component cha gần nhất.
- **Áp dụng thực tế vào dự án PubliCast:**
  Thay vì trang Search và Header tự giữ từ khóa, ta "nhấc" nó lên hoặc dùng Context.

### 37. Controlled Component là gì?
- **Lý thuyết:** Component mà giá trị input do State quản lý.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng trong trang Login/Register để đảm bảo dữ liệu gửi lên API luôn sạch và được kiểm soát.

### 38. useReducer dùng khi nào?
- **Lý thuyết:** Khi logic state phức tạp, nhiều rẽ nhánh.
- **Áp dụng thực tế vào dự án PubliCast:**
  Thích hợp cho giỏ hàng nếu có nhiều action: ADD, REMOVE, CLEAR, APPLY_COUPON.

### 39. useState và useReducer khác nhau?
- **Lý thuyết:** useState cho dữ liệu đơn giản, useReducer cho logic phức tạp.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án dùng `useState` cho hầu hết trường hợp vì nghiệp vụ e-commerce cơ bản đủ đáp ứng.

### 40. Context API là gì?
- **Lý thuyết:** Truyền dữ liệu xuyên suốt mà không cần props drilling.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) để chia sẻ giỏ hàng toàn ứng dụng.

### 41. Props Drilling là gì?
- **Lý thuyết:** Truyền props qua quá nhiều tầng trung gian.
- **Áp dụng thực tế vào dự án PubliCast:**
  Được giải quyết triệt để nhờ sử dụng `CartContext` và `AuthContext`.

### 42. Redux là gì?
- **Lý thuyết:** Store tập trung quản lý toàn bộ state ứng dụng.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dành cho việc quản lý các trạng thái cực lớn như Dashboard Admin hoặc hệ thống lọc sản phẩm hàng nghìn mẫu.

### 43. Redux Toolkit là gì?
- **Lý thuyết:** Bộ công cụ chuẩn giúp viết Redux ít code thừa hơn (createSlice).
- **Áp dụng thực tế vào dự án PubliCast:**
  Cấu hình store hiện đại cho admin module để quản lý đơn hàng và khách hàng.

### 44. Global State và Local State khác nhau?
- **Lý thuyết:** Local dùng trong 1 file, Global dùng toàn ứng dụng.
- **Áp dụng thực tế vào dự án PubliCast:**
  `isLoading` là Local, `user` info là Global.

### 45. Khi nào không nên dùng Redux?
- **Lý thuyết:** Khi app nhỏ, dữ liệu không chia sẻ chéo nhiều.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giai đoạn đầu PubliCast chỉ dùng Context API cho nhẹ nhàng.

### 46. Zustand là gì?
- **Lý thuyết:** Thư viện quản lý state siêu nhẹ, thay thế Redux và Context.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lựa chọn thay thế nếu giỏ hàng cần tối ưu hiệu năng render khi số lượng item cực lớn.

### 47. Re-render xảy ra khi nào?
- **Lý thuyết:** Khi State, Props hoặc Context đổi.
- **Áp dụng thực tế vào dự án PubliCast:**
  Khi đăng nhập xong, `user` đổi -> Header re-render hiện avatar thay nút Login.

### 48. React.memo dùng để làm gì?
- **Lý thuyết:** Tránh render lại component con nếu Props không đổi.
- **Áp dụng thực tế vào dự án PubliCast:**
  Bọc `ProductCard` để danh sách sản phẩm cuộn mượt mà hơn.

### 49. useMemo và useCallback khác gì?
- **Lý thuyết:** useMemo nhớ giá trị, useCallback nhớ định nghĩa hàm.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng `useCallback` cho các hàm truyền xuống button để tránh re-render vô ích.

### 50. Immutable State là gì?
- **Lý thuyết:** Không sửa trực tiếp, luôn tạo bản sao mới.
- **Áp dụng thực tế vào dự án PubliCast:**
  **Đúng:** `setCart({...cart, total: 100})`. **Sai:** `cart.total = 100`.

### 51. Vì sao React cần immutable?
- **Lý thuyết:** Để so sánh tham chiếu (===) nhanh chóng, nhận biết thay đổi ngay lập tức.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giúp React nhận biết giỏ hàng thay đổi để cập nhật UI ngay lập tức.

### 52. Async State Update là gì?
- **Lý thuyết:** Cập nhật state sau tác vụ bất đồng bộ (API).
- **Áp dụng thực tế vào dự án PubliCast:**
  Cập nhật giỏ hàng sau khi nhận phản hồi từ server: `const data = await getCart(); setCart(data);`.

### 53. Redux Middleware là gì?
- **Lý thuyết:** Hàm trung gian giữa dispatch action và reducer (như Logger, Thunk).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng `redux-logger` để debug dòng dữ liệu trong môi trường dev.

### 54. Redux Thunk dùng để làm gì?
- **Lý thuyết:** Cho phép action trả về hàm để gọi API bất đồng bộ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng để thực hiện luồng: Gửi request -> Chờ API -> Dispatch kết quả vào Store.

### 55. Redux Saga khác Thunk thế nào?
- **Lý thuyết:** Saga dùng Generator, mạnh mẽ hơn cho logic phức tạp (retry, cancel).
- **Áp dụng thực tế vào dự án PubliCast:**
  Thích hợp cho hệ thống thanh toán cần kiểm soát giao dịch cực kỳ chặt chẽ.

### 56. Persist State là gì?
- **Lý thuyết:** Lưu state vào LocalStorage để không mất khi F5.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lưu `accessToken` để duy trì trạng thái đăng nhập của người dùng.

### 57. Hydration trong React là gì?
- **Lý thuyết:** Quá trình gắn sự kiện vào HTML có sẵn từ server (SSR).
- **Áp dụng thực tế vào dự án PubliCast:**
  Nền tảng nếu dự án dùng Next.js để SEO tốt hơn.

### 58. RTK Query là gì?
- **Lý thuyết:** Công cụ fetch và cache dữ liệu API cực mạnh trong Redux Toolkit.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giúp tự động hóa việc gọi API danh mục sản phẩm và tự động refresh cache.

### 59. So sánh Redux và Context API?
- **Lý thuyết:** Context nhẹ cho app nhỏ, Redux mạnh cho app lớn cần debug sâu.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án chọn Context cho giỏ hàng vì đơn giản và đủ dùng.

### 60. Bạn sẽ chọn state management nào cho project?
- **Lý thuyết:** Phụ thuộc quy mô và bài toán.
- **Áp dụng thực tế vào dự án PubliCast:**
  Kết hợp `useState` cho form và `Context API` cho Auth/Cart là tối ưu nhất.

---

## PHẦN V: REDIS CACHE, STORAGE & REALTIME SYSTEM (CÂU 61 - 92)

### 61. Redis là gì?
- **Lý thuyết:** CSDL in-memory (RAM), tốc độ cực nhanh.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng lưu OTP và Refresh Token.
  ```javascript
  await redisClient.set(`otp:${email}`, otp, { EX: 600 });
  ```

### 62. Redis khác MySQL/MongoDB thế nào?
- **Lý thuyết:** Redis lưu RAM (tốc độ), DB khác lưu Đĩa (bền vững).
- **Áp dụng thực tế vào dự án PubliCast:**
  - **MongoDB:** Lưu thông tin User vĩnh viễn.
  - **Redis:** Lưu OTP (tạm thời 10 phút).

### 63. Vì sao Redis nhanh?
- **Lý thuyết:** RAM-based, Single-threaded, I/O Multiplexing.
- **Áp dụng thực tế vào dự án PubliCast:**
  API xác thực OTP phản hồi < 10ms, mang lại trải nghiệm mượt mà.

### 64. Redis thường dùng để làm gì?
- **Lý thuyết:** Cache, Session, Rate Limit, Queue.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giới hạn gửi OTP 60s/lần bằng Redis.

### 65. Cache là gì?
- **Lý thuyết:** Lưu bản sao dữ liệu tại nơi truy xuất nhanh.
- **Áp dụng thực tế vào dự án PubliCast:**
  Cache danh mục sản phẩm trang chủ để giảm tải cho MongoDB.

### 66. TTL trong Redis là gì?
- **Lý thuyết:** Time To Live - Thời gian sống của key.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tự động xóa OTP sau 10 phút để bảo mật.

### 67. Redis Data Types gồm gì?
- **Lý thuyết:** String, Hash, List, Set, Sorted Set.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng **List** để làm Email Queue xử lý ngầm.

### 68. String trong Redis dùng khi nào?
- **Lý thuyết:** Lưu giá trị đơn giản, counter.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lưu `otp:email` chứa mã 6 số.

### 69. Hash trong Redis dùng khi nào?
- **Lý thuyết:** Lưu đối tượng nhiều trường.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lưu metadata phiên làm việc (device, last active).

### 70. Redis Pub/Sub là gì?
- **Lý thuyết:** Mô hình gửi-nhận tin nhắn realtime qua kênh.
- **Áp dụng thực tế vào dự án PubliCast:**
  Đồng bộ thông báo đơn hàng mới khi chạy nhiều server.

### 71. Redis Queue là gì?
- **Lý thuyết:** Hàng đợi xử lý công việc bất đồng bộ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Gửi email đăng ký thành công qua hàng đợi ngầm.

### 72. Session trong Redis là gì?
- **Lý thuyết:** Lưu trạng thái đăng nhập tập trung cho đa server.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lưu Refresh Token hash để check login xuyên suốt các request.

### 73. Redis Persistence là gì?
- **Lý thuyết:** Ghi dữ liệu RAM xuống đĩa (RDB, AOF).
- **Áp dụng thực tế vào dự án PubliCast:**
  Đảm bảo không mất giỏ hàng tạm khi server Redis restart.

### 74. Redis có nhược điểm gì?
- **Lý thuyết:** Tốn RAM (đắt), dữ liệu lớn dễ tràn bộ nhớ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Luôn đặt TTL và chỉ lưu dữ liệu nhỏ để tối ưu.

### 75. Rate Limiting bằng Redis?
- **Lý thuyết:** Chặn spam request dựa trên bộ đếm key.
- **Áp dụng thực tế vào dự án PubliCast:**
  Chặn gửi lại OTP trong vòng 60 giây.

### 76. Cache Aside Pattern là gì?
- **Lý thuyết:** Check cache -> Miss -> Read DB -> Update Cache.
- **Áp dụng thực tế vào dự án PubliCast:**
  Áp dụng cho trang chi tiết sản phẩm.

### 77. Cache Invalidation là gì?
- **Lý thuyết:** Xóa/Cập nhật cache khi DB thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:**
  Xóa cache sản phẩm khi Admin sửa giá.

### 78. Redis Cluster là gì?
- **Lý thuyết:** Phân mảnh dữ liệu trên nhiều node để scale ngang.
- **Áp dụng thực tế vào dự án PubliCast:**
  Khi hệ thống đạt hàng triệu user truy cập.

### 79. Redis Sentinel là gì?
- **Lý thuyết:** Giám sát, tự động chuyển đổi Master-Slave khi lỗi.
- **Áp dụng thực tế vào dự án PubliCast:**
  Đảm bảo hệ thống giỏ hàng luôn sống 24/7.

### 80. Khi nào không nên dùng Redis?
- **Lý thuyết:** Dữ liệu cực lớn, ít dùng, cần quan hệ phức tạp.
- **Áp dụng thực tế vào dự án PubliCast:**
  Không lưu lịch sử mua hàng 10 năm của khách vào Redis.

### 81. React frontend dùng Redis trực tiếp không?
- **Lý thuyết:** Không, vì bảo mật. Phải qua API Backend.
- **Áp dụng thực tế vào dự án PubliCast:**
  React gọi Express -> Express gọi Redis lấy cache.

### 82. Redis thường kết hợp React để làm gì?
- **Lý thuyết:** Tăng tốc hiển thị UI bằng dữ liệu cache API.
- **Áp dụng thực tế vào dự án PubliCast:**
  Load danh mục sản phẩm gần như tức thì khi mở app.

### 83. React login với Redis session hoạt động sao?
- **Lý thuyết:** Credentials -> Backend lưu session Redis -> Trả ID qua Cookie.
- **Áp dụng thực tế vào dự án PubliCast:**
  Kiểm tra Refresh Token hash trong Redis ở mỗi request.

### 84. Redis giúp React app nhanh hơn thế nào?
- **Lý thuyết:** Giảm thời gian chờ API (Latency).
- **Áp dụng thực tế vào dự án PubliCast:**
  Trang Checkout load thông tin giỏ hàng siêu nhanh.

### 85. React realtime chat dùng Redis như thế nào?
- **Lý thuyết:** Đồng bộ tin nhắn giữa các server qua Pub/Sub.
- **Áp dụng thực tế vào dự án PubliCast:**
  Hỗ trợ Live Chat giữa Khách hàng và Admin.

### 86. Redis với Socket.IO dùng để làm gì?
- **Lý thuyết:** Đồng bộ sự kiện socket giữa nhiều máy chủ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Hiện thông báo đơn hàng mới realtime cho Admin.

### 87. Vì sao cache API cho React app?
- **Lý thuyết:** Giảm tải DB, giảm băng thông, tăng UX.
- **Áp dụng thực tế vào dự án PubliCast:**
  Người dùng không thấy màn hình trắng khi chuyển trang.

### 88. Ví dụ cache Express API bằng Redis
- **Lý thuyết:** Middleware chặn request, check key cache trong Redis.
- **Áp dụng thực tế vào dự án PubliCast:**
  Cache kết quả search sản phẩm theo từ khóa.

### 89. Redis và JWT liên quan gì?
- **Lý thuyết:** Lưu Blacklist token đã Logout hoặc thu hồi Refresh Token.
- **Áp dụng thực tế vào dự án PubliCast:**
  Xóa key Redis khi user click Logout để vô hiệu hóa phiên.

### 90. Làm sao tránh cache stampede?
- **Lý thuyết:** Dùng Distributed Lock để chỉ 1 request được nạp cache.
- **Áp dụng thực tế vào dự án PubliCast:**
  Bảo vệ server khi danh sách sản phẩm Hot Sale hết hạn cache đúng lúc cao điểm.

### 91. Cache warming là gì?
- **Lý thuyết:** Chủ động nạp dữ liệu hot khi khởi động server.
- **Áp dụng thực tế vào dự án PubliCast:**
  Nạp 10 sản phẩm bán chạy nhất vào Redis khi server boot xong.

### 92. Làm sao scale Redis?
- **Lý thuyết:** Vertical (Tăng RAM) hoặc Horizontal (Cluster).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng Managed Redis (AWS/RedisCloud) khi traffic tăng cao.

---

## PHẦN VI: NODE.JS INTERNALS, ASYNC/AWAIT & ARCHITECTURE (CÂU 93 - 113)

### 93. Node.js là gì?
- **Lý thuyết:** Runtime JS ngoài trình duyệt, dựa trên V8.
- **Áp dụng thực tế vào dự án PubliCast:**
  Nền tảng chạy toàn bộ mã nguồn Backend thư mục `backend/src/`.

### 94. Vì sao Node.js nhanh?
- **Lý thuyết:** V8 engine, Non-blocking I/O, Event Loop.
- **Áp dụng thực tế vào dự án PubliCast:**
  Xử lý hàng nghìn request đặt hàng đồng thời mà không nghẽn luồng.

### 95. Event Loop là gì?
- **Lý thuyết:** Cơ chế điều phối các tác vụ bất đồng bộ trên một luồng.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giúp server rảnh tay tiếp nhận request mới trong khi chờ DB trả kết quả.

### 96. Blocking và Non-blocking khác nhau?
- **Lý thuyết:** Blocking phải chờ, Non-blocking chạy tiếp code sau.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng `async/await` để thực hiện Non-blocking I/O cho mọi truy vấn DB.

### 97. Callback là gì?
- **Lý thuyết:** Hàm được truyền làm tham số để thực thi sau.
- **Áp dụng thực tế vào dự án PubliCast:**
  Hàm `next()` trong middleware là một callback điển hình.

### 98. Callback Hell là gì?
- **Lý thuyết:** Lồng quá nhiều callback làm code hình kim tự tháp.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tránh triệt để bằng cách dùng `async/await` trong `AuthService`.

### 99. Promise là gì?
- **Lý thuyết:** Đối tượng đại diện cho kết quả (thành công/thất bại) trong tương lai.
- **Áp dụng thực tế vào dự án PubliCast:**
  Các truy vấn Mongoose như `Product.find()` luôn trả về Promise.

### 100. Async/Await là gì?
- **Lý thuyết:** Cú pháp giúp code bất đồng bộ trông giống đồng bộ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Chuẩn viết code cho toàn bộ Service và Controller của dự án.

### 101. require và import khác nhau?
- **Lý thuyết:** require (CommonJS) nạp lúc chạy, import (ESM) nạp lúc phân tích code.
- **Áp dụng thực tế vào dự án PubliCast:**
  - **Backend:** require. **Frontend:** import.

### 102. package.json dùng để làm gì?
- **Lý thuyết:** Chứa metadata dự án, script và quản lý dependencies.
- **Áp dụng thực tế vào dự án PubliCast:**
  Nơi khai báo các thư viện chủ chốt như `express`, `mongoose`, `redis`.

### 103. next() trong middleware là gì?
- **Lý thuyết:** Hàm báo cho Express chuyển sang middleware kế tiếp.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng sau khi validate dữ liệu xong tại `validation.middleware.js`.

### 104. Express Router là gì?
- **Lý thuyết:** Module hóa định tuyến theo từng thực thể.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tách riêng `auth.routes.js`, `product.routes.js` để code sạch sẽ.

### 105. body-parser là gì?
- **Lý thuyết:** Middleware parse dữ liệu từ request body.
- **Áp dụng thực tế vào dự án PubliCast:**
  `app.use(express.json())` giúp lấy dữ liệu đăng ký từ `req.body`.

### 106. bcrypt dùng để làm gì?
- **Lý thuyết:** Mã hóa một chiều (hashing) mật khẩu kèm Salt.
- **Áp dụng thực tế vào dự án PubliCast:**
  Bảo mật tuyệt đối mật khẩu người dùng trong MongoDB.

### 107. Hash và Encrypt khác nhau?
- **Lý thuyết:** Hash là 1 chiều (password), Encrypt là 2 chiều (data cần giải mã).
- **Áp dụng thực tế vào dự án PubliCast:**
  Hash mật khẩu, mã hóa Token JWT.

### 108. Xử lý lỗi Express như thế nào?
- **Lý thuyết:** Dùng middleware tập trung cuối file app.js.
- **Áp dụng thực tế vào dự án PubliCast:**
  Trả về lỗi JSON chuẩn cho Frontend thay vì làm sập server.

### 109. Multer dùng để làm gì?
- **Lý thuyết:** Middleware xử lý upload file (multipart/form-data).
- **Áp dụng thực tế vào dự án PubliCast:**
  Upload ảnh sản phẩm e-commerce.

### 110. Socket.IO dùng để làm gì?
- **Lý thuyết:** Truyền tin nhắn 2 chiều realtime.
- **Áp dụng thực tế vào dự án PubliCast:**
  Báo đơn hàng mới cho Admin.

### 111. Vì sao Node.js phù hợp realtime?
- **Lý thuyết:** Chi phí duy trì kết nối thấp nhờ Event-driven.
- **Áp dụng thực tế vào dự án PubliCast:**
  Hỗ trợ hàng nghìn khách hàng nhận thông báo khuyến mãi cùng lúc.

### 112. MVC trong Express là gì?
- **Lý thuyết:** Phân tách Model, View, Controller.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tổ chức mã nguồn theo lớp để dễ bảo trì và mở rộng.

### 113. Monolith và Microservice khác nhau?
- **Lý thuyết:** Gộp chung (Monolith) vs Chia nhỏ (Microservice).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dự án là Monolith để tối ưu tốc độ phát triển giai đoạn đầu.

---

## PHẦN VII: API DESIGN, SECURITY & AUTHENTICATION (CÂU 114 - 130)

### 114. API là gì?
- **Lý thuyết:** Giao diện lập trình để các ứng dụng giao tiếp với nhau.
- **Áp dụng thực tế vào dự án PubliCast:**
  Cầu nối giữa React Frontend và Node.js Backend.

### 115. REST API là gì?
- **Lý thuyết:** API tuân thủ kiến trúc REST, dùng HTTP.
- **Áp dụng thực tế vào dự án PubliCast:**
  Mọi endpoint trong dự án đều trả về JSON.

### 116. HTTP Methods gồm những gì?
- **Lý thuyết:** GET (Lấy), POST (Tạo), PUT/PATCH (Sửa), DELETE (Xóa).
- **Áp dụng thực tế vào dự án PubliCast:**
  PATCH dùng cho update số lượng giỏ hàng, DELETE dùng cho xóa sản phẩm.

### 117. Khác nhau giữa PUT và PATCH?
- **Lý thuyết:** PUT thay thế toàn bộ, PATCH sửa 1 phần.
- **Áp dụng thực tế vào dự án PubliCast:**
  Update quantity giỏ hàng -> dùng PATCH cho tối ưu.

### 118. HTTP Status Code thường dùng?
- **Lý thuyết:** 2xx (Thành công), 4xx (Lỗi Client), 5xx (Lỗi Server).
- **Áp dụng thực tế vào dự án PubliCast:**
  401 (Hết hạn token), 403 (Không đủ quyền Admin).

### 119. JSON là gì?
- **Lý thuyết:** Định dạng dữ liệu dạng key-value, nhẹ và phổ biến.
- **Áp dụng thực tế vào dự án PubliCast:**
  Ngôn ngữ chung giữa Frontend và Backend.

### 120. Endpoint là gì?
- **Lý thuyết:** URL cụ thể để truy cập tài nguyên API.
- **Áp dụng thực tế vào dự án PubliCast:**
  `/api/products/search` là endpoint lấy sản phẩm.

### 121. Request và Response khác nhau?
- **Lý thuyết:** Request từ Client gửi lên, Response từ Server trả về.
- **Áp dụng thực tế vào dự án PubliCast:**
  Tham số `req` và `res` trong mọi Controller.

### 122. Header trong API là gì?
- **Lý thuyết:** Metadata đi kèm (Content-Type, Authorization).
- **Áp dụng thực tế vào dự án PubliCast:**
  Gửi Access Token qua Header `Authorization`.

### 123. Flow login JWT hoạt động sao?
- **Lý thuyết:** Đăng nhập -> Server cấp Access + Refresh Token -> Client lưu và dùng.
- **Áp dụng thực tế vào dự án PubliCast:**
  Bảo mật phiên làm việc không cần dùng Session/Cookie truyền thống trên server.

### 124. Access Token và Refresh Token khác nhau?
- **Lý thuyết:** Access sống ngắn (15p), Refresh sống dài (7 ngày).
- **Áp dụng thực tế vào dự án PubliCast:**
  Giảm thiểu rủi ro khi Access Token bị lộ.

### 125. Nên lưu JWT ở đâu?
- **Lý thuyết:** Access (RAM/Local), Refresh (HttpOnly Cookie).
- **Áp dụng thực tế vào dự án PubliCast:**
  Chống XSS bằng cách không cho JS đọc Refresh Token.

### 126. API versioning là gì?
- **Lý thuyết:** Đánh số phiên bản API (v1, v2).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dễ dàng nâng cấp logic API mà không làm sập app cũ.

### 127. Idempotent API là gì?
- **Lý thuyết:** Gọi nhiều lần kết quả vẫn như cũ (GET, DELETE).
- **Áp dụng thực tế vào dự án PubliCast:**
  Xóa sản phẩm khỏi giỏ 1 hay 10 lần thì nó vẫn bị xóa.

### 128. Stateless API là gì?
- **Lý thuyết:** Server không nhớ Client, mọi info nằm trong Token.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dễ dàng scale server lên nhiều máy mà không cần đồng bộ RAM.

### 129. WebSocket khác REST API thế nào?
- **Lý thuyết:** REST là Hỏi-Đáp, WebSocket là trò chuyện 2 chiều liên tục.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng cả hai để tối ưu hiệu năng và tính realtime.

### 130. GraphQL là gì?
- **Lý thuyết:** Ngôn ngữ truy vấn API, Client tự chọn trường dữ liệu muốn lấy.
- **Áp dụng thực tế vào dự án PubliCast:**
  Lựa chọn nâng cấp nếu hệ thống mobile app cần tiết kiệm băng thông.

---

## PHẦN VIII: FULLSTACK ARCHITECTURE & DEPLOYMENT (CÂU 131 - 136)

### 131. Các cách quản lý state trong React
- **Lý thuyết:** useState, useReducer, Context, Redux, Zustand.
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng `useState` cho form và `Context` cho giỏ hàng/người dùng.

### 132. Vì sao React Query không thay Redux hoàn toàn?
- **Lý thuyết:** React Query lo dữ liệu API, Redux lo dữ liệu UI cục bộ.
- **Áp dụng thực tế vào dự án PubliCast:**
  Kết hợp cả hai để app mượt mà và code sạch sẽ.

### 133. Có bao nhiêu cách phổ biến lưu giỏ hàng
- **Lý thuyết:** LocalStorage (mất khi xóa cache), Database (bền vững), Redis (nhanh).
- **Áp dụng thực tế vào dự án PubliCast:**
  Dùng Database (MongoDB) để khách hàng có thể đăng nhập trên máy khác vẫn thấy giỏ hàng.

### 134. Khi nào nên và không nên dùng Redis cho giỏ hàng?
- **Lý thuyết:** Nên dùng khi traffic cực lớn cần giảm tải DB. Không nên khi app nhỏ.
- **Áp dụng thực tế vào dự án PubliCast:**
  PubliCast giai đoạn đầu dùng MongoDB là đủ đáp ứng và đơn giản.

### 135. Tổng quan các cách deploy
- **Lý thuyết:** VPS, PaaS (Vercel/Render), Docker/K8s.
- **Áp dụng thực tế vào dự án PubliCast:**
  Ưu tiên đóng gói Docker để đảm bảo "Code chạy máy em thì cũng chạy trên server".

### 136. Docker giúp gì?
- **Lý thuyết:** Đóng gói app + môi trường vào Container đồng nhất.
- **Áp dụng thực tế vào dự án PubliCast:**
  Giúp developer setup project chỉ với 1 lệnh `docker compose up`.

---
*Tài liệu PubliCast - Lý thuyết và Thực hành chuẩn hóa 2026.*
