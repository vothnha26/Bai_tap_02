# PubliCast: Lý Thuyết và Thực Hành Hệ Thống 136 Câu Hỏi Chi Tiết (Fullstack Developer)

Tài liệu này hệ thống hóa kiến thức lập trình Fullstack (Node.js, Express, React, Redis, MongoDB Mongoose) dựa trên 136 câu hỏi cốt lõi, tích hợp chi tiết phân tích và liên kết ứng dụng thực tế trong mã nguồn dự án **PubliCast**.

---

## PHẦN I: EXPRESSJS & NODE.JS CORE (CÂU 1 - 8)

### 1. ExpressJS là gì?
- **Lý thuyết:** ExpressJS là một framework tối giản (minimalist) và linh hoạt (flexible) chạy trên nền tảng Node.js, được thiết kế để xây dựng các ứng dụng web và RESTful API. Nó cung cấp các công cụ mạnh mẽ để quản lý các phương thức HTTP routing, tích hợp middleware, cấu hình response headers và xử lý biệt lệ một cách nhanh chóng mà không can thiệp sâu vào cấu trúc mã nguồn của Node.js gốc.
- **Áp dụng thực tế vào dự án PubliCast:** Express app được khởi tạo trong [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) ở dòng 11 (`const app = express();`). Tệp này cấu hình toàn bộ định tuyến API, các middleware cơ bản và xử lý lỗi hệ thống, sau đó được khởi chạy lắng nghe cổng HTTP trong [server.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/server.js).

### 2. Middleware trong ExpressJS là gì?
- **Lý thuyết:** Middleware là các hàm trung gian có quyền truy cập vào các đối tượng Request (`req`), Response (`res`) và hàm điều hướng `next` trong chu kỳ request-response của ứng dụng. Middleware thực hiện các nhiệm vụ: chạy code logic, chỉnh sửa đối tượng `req` và `res`, kết thúc chu kỳ phản hồi bằng cách trả về response (ví dụ: `res.json()`), hoặc gọi hàm `next()` để chuyển quyền xử lý cho middleware tiếp theo trong chuỗi handler (Middleware Chain).
- **Áp dụng thực tế vào dự án PubliCast:** 
  - Middleware xác thực người dùng `verifyAuth` và phân quyền `verifyAdmin` được định nghĩa trong [auth.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/auth.middleware.js).
  - Middleware validation đầu vào nằm ở [validation.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/validation.middleware.js) để chặn các dữ liệu không hợp lệ trước khi đi vào Controller.

### 3. Sự khác nhau giữa app.use() và app.get()?
- **Lý thuyết:** 
  - `app.use()` được sử dụng để đăng ký middleware cho toàn bộ ứng dụng hoặc cho một path prefix cụ thể. Nó sẽ bắt (catch) tất cả các HTTP method (GET, POST, PUT, DELETE, PATCH,...) đi qua tiền tố đó.
  - `app.get()` là phương thức định tuyến cụ thể (routing method) chỉ lắng nghe và xử lý các request sử dụng phương thức HTTP GET khớp chính xác với URL pattern được khai báo.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js), `app.use(express.json())` (dòng 24) áp dụng việc phân tích body JSON cho toàn bộ mọi request, trong khi `app.get('/health', ...)` (dòng 37) chỉ chấp nhận request GET để trả về trạng thái của server.

### 4. RESTful API là gì?
- **Lý thuyết:** REST (Representational State Transfer) là một kiểu kiến trúc thiết kế mạng dựa trên các ràng buộc: Stateless (không lưu trạng thái client trên server), Client-Server độc lập, Cacheable, và Interface đồng nhất. RESTful API sử dụng các HTTP Method chuẩn (GET - đọc, POST - tạo mới, PUT - thay thế, PATCH - cập nhật một phần, DELETE - xóa) kết hợp với các danh từ số nhiều làm endpoint (Resource-based URL) để quản lý tài nguyên hệ thống.
- **Áp dụng thực tế vào dự án PubliCast:** Được triển khai thông qua các module định tuyến trong thư mục `backend/src/routes/`. Ví dụ, trong [product.routes.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/routes/product.routes.js), route GET `/` lấy danh sách sản phẩm, POST `/` tạo sản phẩm mới, PATCH `/:id` cập nhật sản phẩm.

### 5. JWT là gì?
- **Lý thuyết:** JSON Web Token (JWT) là một tiêu chuẩn mở (RFC 7519) định nghĩa phương thức truyền thông tin an toàn giữa các bên dưới dạng đối tượng JSON. Cấu trúc JWT gồm 3 phần phân tách bởi dấu chấm: Header (thuật toán chữ ký), Payload (thông tin cần truyền tải như userId, role) và Signature (chữ ký số tạo từ Header, Payload và một khóa bí mật - Secret Key). JWT giúp thực hiện cơ chế xác thực không trạng thái (stateless authentication).
- **Áp dụng thực tế vào dự án PubliCast:** Logic tạo và xác thực JWT được đóng gói trong class Singleton tại [jwt.utils.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/utils/jwt.utils.js), bao gồm hàm `generateAccessToken()` (sinh access token tồn tại 15 phút) và `verifyAccessToken()` kiểm tra token gửi lên từ client.

### 6. Nên lưu JWT ở đâu?
- **Lý thuyết:** Có hai lựa chọn phổ biến với các ưu/nhược điểm bảo mật khác nhau:
  - **HttpOnly Cookie**: Rất an toàn trước tấn công XSS vì mã JavaScript phía client không thể đọc được cookie này. Cần cấu hình flag `Secure` (chỉ gửi qua HTTPS) và `SameSite` để chống tấn công CSRF.
  - **LocalStorage/SessionStorage**: Tiện lợi khi lập trình SPA, dễ đọc và tự động đính kèm vào Header `Authorization: Bearer <token>`, nhưng dễ bị đánh cắp thông qua các lỗ hổng tiêm mã độc XSS.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng mô hình kết hợp: Access Token được lưu ở LocalStorage phía React và tự động gửi lên qua Header trong [api.client.js](file:///d:/Fullit/tutorials/PubliCast/frontend/src/services/api.client.js) (dòng 14). Refresh Token bảo mật hơn được lưu ở HttpOnly Cookie tại Backend và được gửi tự động thông qua cấu hình `withCredentials: true` của Axios.

### 7. CORS là gì?
- **Lý thuyết:** Cross-Origin Resource Sharing (CORS) là cơ chế an toàn dựa trên HTTP header của trình duyệt, ngăn chặn một trang web ở một nguồn (origin này) truy cập vào tài nguyên của một nguồn khác (origin kia) trừ khi server của nguồn kia khai báo tường minh bằng header `Access-Control-Allow-Origin` cho phép truy cập.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) dòng 20, thư viện `cors` được import và sử dụng để cấu hình Origin của frontend (`http://localhost:5173`) kèm theo thiết lập `credentials: true` nhằm cho phép truyền tải cookie giữa hai cổng khác nhau trong môi trường phát triển local.

### 8. Event Loop trong Node.js là gì?
- **Lý thuyết:** Event Loop là cơ chế cốt lõi giúp Node.js thực thi các tác vụ I/O không chặn (non-blocking) mặc dù JavaScript chỉ chạy đơn luồng (single-threaded). Event Loop hoạt động bằng cách ủy quyền các tác vụ nặng (như truy vấn DB, đọc file, network) cho nhân hệ điều hành hoặc Thread Pool của Libuv xử lý ngầm. Khi tác vụ hoàn thành, callback tương ứng sẽ được xếp vào Queue và Event Loop sẽ đẩy nó vào Call Stack để xử lý khi Call Stack rỗng.
- **Áp dụng thực tế vào dự án PubliCast:** Event Loop đảm bảo server backend xử lý hàng nghìn kết nối từ client đồng thời mà không bị treo khi thực hiện các tác vụ đọc ghi dữ liệu chậm từ MongoDB hoặc Redis trong các API như đăng nhập hoặc kiểm tra giỏ hàng tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js).

---

## PHẦN II: REACTJS & FRONTEND ARCHITECTURE (CÂU 9 - 23)

### 9. ReactJS là gì?
- **Lý thuyết:** ReactJS là một thư viện JavaScript declarative, hiệu quả và linh hoạt dùng để xây dựng giao diện người dùng (UI) dựa trên các component. Thay vì thao tác trực tiếp với DOM thực của trình duyệt (vốn rất chậm), React quản lý trạng thái của ứng dụng và tự động cập nhật UI một cách tối ưu thông qua Virtual DOM và mô hình luồng dữ liệu một chiều (Unidirectional Data Flow).
- **Áp dụng thực tế vào dự án PubliCast:** Toàn bộ mã nguồn thư mục `frontend/src/` được xây dựng bằng ReactJS, với entrypoint là [main.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/main.jsx) thực hiện render component cha [App.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/App.jsx) vào thẻ div `#root` của DOM vật lý.

### 10. Virtual DOM là gì?
- **Lý thuyết:** Virtual DOM (DOM ảo) là một biểu diễn gọn nhẹ của DOM thật dưới dạng các đối tượng JavaScript trong bộ nhớ. Khi dữ liệu (State/Props) của một component thay đổi, React sẽ tạo ra một cây Virtual DOM mới, so sánh nó với cây Virtual DOM cũ bằng thuật toán Diffing để tìm ra sự khác biệt nhỏ nhất (Reconciliation), và chỉ cập nhật các thay đổi cụ thể đó lên DOM vật lý của trình duyệt, tránh việc vẽ lại toàn bộ giao diện.
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng nhấn nút thêm sản phẩm vào giỏ hàng trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx), chỉ có số lượng item trên thanh Header được thay đổi và render lại mà không cần tải lại toàn bộ trang web.

### 11. State và Props khác nhau thế nào?
- **Lý thuyết:** 
  - **State**: Là dữ liệu nội bộ của một component, được khởi tạo và quản lý hoàn toàn bên trong component đó. State có thể thay đổi theo thời gian (ví dụ thông qua `setState`) và khi state đổi, component sẽ re-render.
  - **Props (Properties)**: Là dữ liệu được truyền từ component cha xuống component con. Props là read-only (bất biến) đối với component con; component con không được phép sửa props nhận được mà chỉ có thể đọc và hiển thị.
- **Áp dụng thực tế vào dự án PubliCast:** Trong danh sách sản phẩm, component cha quản lý danh sách sản phẩm dưới dạng `state` (được fetch từ API). Khi render, cha truyền từng đối tượng sản phẩm xuống component con `ProductCard` dưới dạng `props` (ví dụ: `<ProductCard key={product.id} data={product} />`).

### 12. useEffect dùng để làm gì?
- **Lý thuyết:** `useEffect` là một React Hook cho phép thực thi các tác vụ có tác động bên ngoài (Side Effects) trong các functional component, ví dụ như: fetch dữ liệu từ API, thiết lập kết nối WebSocket, đăng ký sự kiện lắng nghe (event listeners), hoặc tương tác trực tiếp với DOM. Hook này nhận vào một hàm callback và một mảng phụ thuộc (dependency array) quyết định khi nào callback được chạy lại.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) tại dòng 70, `useEffect` được gọi với dependency array rỗng (`[]`) để tự động kích hoạt hàm `fetchCart()` ngay khi ứng dụng React vừa được mount lần đầu tiên nhằm tải thông tin giỏ hàng của người dùng.

### 13. Controlled Component là gì?
- **Lý thuyết:** Controlled Component là các thành phần biểu mẫu (form elements như `<input>`, `<textarea>`, `<select>`) mà giá trị (value) của chúng được kiểm soát hoàn toàn bởi React State. Mọi thay đổi về mặt giao diện của phần tử đều kích hoạt một event handler (như `onChange`) để cập nhật state, từ đó state phản hồi ngược lại thuộc tính `value` của phần tử đó.
- **Áp dụng thực tế vào dự án PubliCast:** Form đăng nhập hoặc đăng ký tài khoản ở client sử dụng state để lưu trữ giá trị email, mật khẩu. Khi người dùng gõ phím, hàm `setEmail(e.target.value)` sẽ cập nhật state liên tục để đảm bảo dữ liệu gửi lên API luôn đồng nhất với UI.

### 14. Redux dùng để làm gì?
- **Lý thuyết:** Redux là một thư viện quản lý trạng thái (state management) tập trung cho toàn bộ ứng dụng JavaScript. Nó hoạt động theo nguyên tắc: Một nguồn sự thật duy nhất (Single Source of Truth) lưu trong một Store toàn cục; State trong store là chỉ đọc (Read-only); Thay đổi state chỉ được thực hiện bằng cách dispatch một Action (đối tượng mô tả sự kiện) gửi đến Reducer (hàm thuần khiết tính toán state mới từ state cũ và action).
- **Áp dụng thực tế vào dự án PubliCast:** Thư mục `frontend/src/redux/` được thiết kế sẵn để mở rộng quản lý các trạng thái phức tạp như thông tin tài khoản đăng nhập admin, cấu hình ứng dụng hoặc danh sách sản phẩm lớn được chia sẻ xuyên suốt qua nhiều trang khác nhau.

### 15. Khác nhau giữa useMemo và useCallback?
- **Lý thuyết:** Cả hai đều là hook dùng để tối ưu hóa hiệu năng bằng cách tránh tính toán lại không cần thiết:
  - `useMemo`: Ghi nhớ (cache) kết quả trả về của một hàm tính toán phức tạp. Nó chỉ tính toán lại khi một trong các dependency thay đổi.
  - `useCallback`: Ghi nhớ chính định nghĩa của một hàm (function instance). Nó tránh việc định nghĩa lại hàm đó ở mỗi lần component cha re-render, thường dùng khi truyền callback xuống component con được bọc trong `React.memo` để tránh component con bị re-render vô ích.
- **Áp dụng thực tế vào dự án PubliCast:** Khi tính toán tổng số tiền hoặc số lượng item trong giỏ hàng trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) dòng 83: `itemCount` có thể được bọc trong `useMemo` để tránh duyệt lại mảng `cart.items` mỗi khi những thành phần giao diện không liên quan bị re-render.

### 16. React Router là gì?
- **Lý thuyết:** React Router là thư viện định tuyến tiêu chuẩn cho các ứng dụng React. Nó cho phép định nghĩa các route (đường dẫn URL) tương ứng với các component khác nhau. Khi URL thay đổi, React Router sẽ chặn hành vi tải lại trang của trình duyệt và thay thế component hiển thị tương ứng trên màn hình, giúp ứng dụng hoạt động như một Single Page Application thực thụ.
- **Áp dụng thực tế vào dự án PubliCast:** Khai báo cấu trúc định tuyến tại [routes.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/routes.jsx), ánh xạ `/login` đến component `LoginPage`, `/cart` đến `CartPage` và cấu hình các route bảo vệ (Protected Routes) chỉ cho phép admin truy cập vào `/admin`.

### 17. Axios khác fetch thế nào?
- **Lý thuyết:** 
  - `fetch` là API tích hợp sẵn của trình duyệt. Nó yêu cầu code thủ công nhiều bước: phải parse JSON thủ công qua `.json()`, không tự động ném lỗi khi gặp mã HTTP 4xx/5xx, và không hỗ trợ trực tiếp cơ chế hủy request hoặc timeout.
  - `Axios` là thư viện bên ngoài hỗ trợ tự động chuyển đổi JSON (automatic JSON transformation), hỗ trợ cấu hình interceptors (chặn request/response để xử lý tập trung), cấu hình timeout dễ dàng, và tương thích tốt trên các trình duyệt cũ hơn.
- **Áp dụng thực tế vào dự án PubliCast:** [api.client.js](file:///d:/Fullit/tutorials/PubliCast/frontend/src/services/api.client.js) sử dụng Axios để tận dụng tối đa `api.interceptors.request` (tự động đính kèm Token) và `api.interceptors.response` (tự động giải nén `response.data` và kiểm soát lỗi tập trung).

### 18. Authentication flow React + Express?
- **Lý thuyết:** Quy trình xác thực chuẩn:
  1. Client gửi credentials (email/password) qua HTTPS.
  2. Server xác thực và tạo cặp Access Token (sống ngắn) và Refresh Token (sống dài).
  3. Server gửi trả Access Token trong JSON response body và thiết lập Refresh Token trong HttpOnly Cookie.
  4. Client lưu Access Token vào bộ nhớ/LocalStorage và đính kèm vào Header `Authorization` cho các request tiếp theo.
  5. Khi Access Token hết hạn (nhận mã 401), Client tự động gọi API `/refresh` gửi kèm Refresh Token (từ cookie) để lấy Access Token mới.
- **Áp dụng thực tế vào dự án PubliCast:** Luồng được triển khai toàn diện tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) phía backend và được client gọi thông qua Axios interceptor tại [api.client.js](file:///d:/Fullit/tutorials/PubliCast/frontend/src/services/api.client.js).

### 19. Xử lý upload file an toàn ExpressJS?
- **Lý thuyết:** Tải file lên server tiềm ẩn nhiều nguy cơ bảo mật như mã độc hoặc làm cạn kiệt tài nguyên đĩa cứng. Để an toàn, cần: sử dụng các thư viện parser luồng dữ liệu streaming như `Multer`; giới hạn dung lượng tối đa của file; kiểm tra định dạng file (MIME type) ở cả header và phần mở rộng; đặt lại tên file ngẫu nhiên (tránh ghi đè file hệ thống); và lưu trữ file ở thư mục tĩnh không có quyền thực thi mã nguồn.
- **Áp dụng thực tế vào dự án PubliCast:** Sử dụng middleware cấu hình từ thư viện `Multer` ở backend để upload ảnh sản phẩm. Giới hạn dung lượng và kiểm tra định dạng ảnh (JPEG, PNG) trước khi ghi file vào thư mục `/uploads`.

### 20. SQL Injection và XSS là gì?
- **Lý thuyết:**
  - **SQL Injection**: Tấn công bằng cách tiêm mã SQL độc hại vào các input của người dùng nhằm thay đổi truy vấn SQL gửi tới Database. Phòng chống bằng cách dùng Parameterized Queries hoặc ORM/ODM (như Mongoose/Prisma) thay vì nối chuỗi SQL thủ công.
  - **Cross-Site Scripting (XSS)**: Tấn công bằng cách tiêm mã JavaScript độc hại vào trang web để chạy trên trình duyệt của người dùng khác. Phòng chống bằng cách làm sạch dữ liệu đầu vào (escaping/sanitizing) và dùng HttpOnly Cookie để lưu token nhạy cảm.
- **Áp dụng thực tế vào dự án PubliCast:** 
  - Tránh SQLi hoàn toàn bằng việc dùng Mongoose ODM truy vấn cơ sở dữ liệu MongoDB thông qua các đối tượng Schema.
  - Chống XSS bằng cách sử dụng `trim().escape()` của thư viện `express-validator` trong [validation.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/validation.middleware.js) dòng 4 để chuyển đổi các ký tự HTML nguy hiểm như `<` thành `&lt;`.

### 21. SSR và CSR khác nhau?
- **Lý thuyết:**
  - **CSR (Client-Side Rendering)**: Trình duyệt tải về một file HTML rỗng và một file JS lớn. JavaScript sẽ chạy và tự tạo dựng (render) toàn bộ giao diện tại client. Ưu điểm là chuyển trang nhanh, mượt mà sau khi tải lần đầu, nhưng nhược điểm là thời gian tải trang đầu (FCP) chậm và SEO kém.
  - **SSR (Server-Side Rendering)**: Server biên dịch mã nguồn và tạo ra file HTML chứa sẵn nội dung giao diện đầy đủ để trả về cho trình duyệt. Trình duyệt hiển thị ngay nội dung đó và tiến hành gắn sự kiện (Hydration). Ưu điểm là SEO tốt, tải trang đầu nhanh, nhưng tốn tài nguyên server hơn.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng mô hình CSR được đóng gói bằng React + Vite tại client, giúp giảm tải tối đa cho server backend, server chỉ cần tập trung xử lý và trả về dữ liệu thô dạng JSON qua RESTful API.

### 22. Vì sao React re-render?
- **Lý thuyết:** Một component trong React sẽ thực hiện chu kỳ vẽ lại (re-render) khi xảy ra một trong các điều kiện sau:
  1. Trạng thái nội tại (`state`) của component thay đổi (thông qua hàm update state).
  2. Thuộc tính (`props`) truyền vào từ component cha thay đổi giá trị hoặc tham chiếu.
  3. Component cha của nó bị re-render (kéo theo các con cũng render lại trừ khi dùng `React.memo`).
  4. Sử dụng Context API và giá trị trong `Context.Provider` mà component đó đăng ký tiêu dùng bị thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng click chọn thay đổi số lượng sản phẩm, state `cart` trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) được cập nhật lại, kích hoạt re-render cho component giỏ hàng và cập nhật tổng số tiền hiển thị trên UI.

### 23. ExpressJS có nhược điểm gì?
- **Lý thuyết:** Điểm yếu lớn nhất của ExpressJS xuất phát từ chính triết lý "tối giản" của nó. Nó không ép buộc bất kỳ một kiến trúc thư mục chuẩn nào (như MVC, Onion, Clean Architecture), khiến cho các dự án lớn dễ bị lộn xộn, thiếu tính đồng nhất. Ngoài ra, việc lồng ghép quá nhiều middleware bất đồng bộ không có cơ chế quản lý lỗi tốt dễ dẫn đến rò rỉ bộ nhớ hoặc crash server nếu lập trình viên không xử lý bắt lỗi triệt để.
- **Áp dụng thực tế vào dự án PubliCast:** Để khắc phục nhược điểm này, dự án áp dụng mô hình phân lớp rõ ràng: Routes -> Middlewares -> Controllers -> Services -> Repositories -> Models. Nhờ vậy logic được tách biệt độc lập và dễ dàng mở rộng, bảo trì.

---

## PHẦN III: DATABASE, DEPLOYMENT & DEVOPS (CÂU 24 - 30)

### 24. MongoDB khác MySQL?
- **Lý thuyết:**
  - **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ (RDBMS), tổ chức dữ liệu dưới dạng các bảng (tables) gồm các dòng và cột với schema cố định. Hỗ trợ mạnh mẽ các mối quan hệ (JOIN) và giao dịch phức tạp tuân thủ tính chất ACID.
  - **MongoDB**: Hệ cơ sở dữ liệu phi quan hệ (NoSQL) hướng tài liệu (Document-oriented), lưu dữ liệu dưới dạng JSON/BSON linh hoạt. Dễ dàng mở rộng quy mô theo chiều ngang (Sharding), phù hợp với dữ liệu phi cấu trúc hoặc cấu trúc thay đổi liên tục.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng MongoDB làm cơ sở dữ liệu chính thông qua thư viện Mongoose ODM được kết nối tại [mongoose.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/config/mongoose.js), giúp lưu trữ các tài liệu có cấu trúc phân tầng như sản phẩm (`Product.js`), danh mục (`Category.js`) và đơn hàng (`Order.js`) một cách tự nhiên.

### 25. Refresh Token là gì?
- **Lý thuyết:** Refresh Token là một chuỗi mã xác thực (thường là JWT hoặc chuỗi ngẫu nhiên có độ dài lớn) được cấp cùng với Access Token khi đăng nhập thành công. Khác với Access Token có thời gian sống rất ngắn (vài phút) để giảm thiểu rủi ro nếu bị lộ, Refresh Token có thời gian sống dài hơn (vài ngày hoặc vài tuần) và chỉ được gửi lên endpoint `/refresh-token` để yêu cầu cấp lại Access Token mới mà không bắt người dùng nhập lại mật khẩu.
- **Áp dụng thực tế vào dự án PubliCast:** Triển khai cơ chế Refresh Token trong [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) tại phương thức `refreshTokens()`. Refresh Token được lưu trữ bảo mật dưới dạng Hash SHA-256 trong Redis nhằm thu hồi tức thì (Revocation) khi người dùng đổi mật khẩu hoặc đăng xuất.

### 26. Bạn tối ưu React app như thế nào?
- **Lý thuyết:** Các kỹ thuật tối ưu hóa phổ biến bao gồm:
  1. **Code Splitting**: Sử dụng `React.lazy()` và `Suspense` để chia nhỏ bundle JS lớn, chỉ tải component khi người dùng chuyển hướng đến trang đó.
  2. **Tránh re-render thừa**: Áp dụng `React.memo`, `useMemo`, `useCallback` một cách hợp lý.
  3. **Tối ưu hình ảnh**: Sử dụng kỹ thuật Lazy loading hình ảnh, chuyển đổi định dạng ảnh hiện đại (WebP).
  4. **Giảm dung lượng bundle**: Sử dụng các thư viện nhẹ thay thế, xóa bỏ các import không dùng (Tree shaking).
- **Áp dụng thực tế vào dự án PubliCast:** Định tuyến trong [routes.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/routes.jsx) có thể áp dụng `React.lazy()` để trì hoãn việc load code của trang Admin hay trang thanh toán cho đến khi người dùng thực sự click điều hướng vào đó.

### 27. Bạn deploy React + Express như thế nào?
- **Lý thuyết:** Mô hình triển khai phổ biến:
  - **Phân tách**: Deploy Frontend lên các nền tảng CDN tĩnh (như Vercel, Netlify hoặc AWS S3) để tải giao diện cực nhanh. Deploy Backend lên VPS (như AWS EC2, DigitalOcean) hoặc nền tảng PaaS (Render, Heroku) chạy Node.js.
  - **Đóng gói Docker**: Đóng gói cả frontend và backend thành các Docker Container riêng biệt để đảm bảo tính đồng nhất môi trường và dễ dàng điều phối qua Kubernetes hoặc Docker Compose.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án cung cấp tệp cấu hình `docker-compose.yml` trong thư mục backend để tự động khởi tạo và liên kết các container MongoDB, Redis và Node.js chỉ bằng một dòng lệnh duy nhất.

### 28. PM2 là gì?
- **Lý thuyết:** PM2 là một trình quản lý tiến trình (Process Manager) chuyên nghiệp cho các ứng dụng Node.js trong môi trường Production. PM2 giúp ứng dụng chạy ngầm dưới nền, tự động khởi động lại (auto-restart) ứng dụng nếu bị crash, hỗ trợ chế độ Cluster Mode giúp chạy đa tiến trình tận dụng tối đa số lượng nhân CPU và hỗ trợ ghi nhận log hệ thống.
- **Áp dụng thực tế vào dự án PubliCast:** Khi triển khai server backend lên máy chủ thực tế (VPS), PM2 được sử dụng thông qua file cấu hình `ecosystem.config.js` để khởi chạy tiến trình `src/server.js` ở chế độ Cluster giúp tối ưu hiệu năng và đảm bảo tính sẵn sàng cao.

### 29. Khác nhau giữa Authentication và Authorization?
- **Lý thuyết:** 
  - **Authentication (Xác thực - AuthN)**: Là quá trình kiểm tra và xác định danh tính của một thực thể truy cập hệ thống (Hỏi câu hỏi: *"Bạn là ai?"*). Ví dụ: Đăng nhập bằng mật khẩu, OTP, hoặc quét vân tay.
  - **Authorization (Phân quyền - AuthZ)**: Là quá trình xác định những quyền hạn cụ thể mà một thực thể đã được xác thực được phép thực hiện trên hệ thống (Hỏi câu hỏi: *"Bạn được phép làm những gì?"*). Ví dụ: Chỉ Admin mới có quyền xóa sản phẩm.
- **Áp dụng thực tế vào dự án PubliCast:** Middleware `verifyAuth` chịu trách nhiệm Authentication (xác thực chữ ký JWT). Nếu vượt qua, request sẽ đi tiếp tới middleware `verifyAdmin` chịu trách nhiệm Authorization (kiểm tra `req.user.role === 'ADMIN'`) tại [auth.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/auth.middleware.js).

### 30. Vì sao chọn React thay Angular/Vue?
- **Lý thuyết:** 
  - So với **Angular** (một framework toàn diện, độ dốc học tập lớn, cấu trúc quá nặng và ràng buộc cao), React là một thư viện gọn nhẹ, linh hoạt và dễ tiếp cận hơn.
  - So với **Vue** (dễ học nhưng hệ sinh thái nhỏ hơn), React sở hữu một cộng đồng nhà phát triển khổng lồ, hệ sinh thái thư viện phong phú (Redux, React Router, TailwindCSS) và mô hình tư duy JSX (JavaScript XML) tự nhiên giúp viết UI thuần JS hiệu quả.
- **Áp dụng thực tế vào dự án PubliCast:** Việc lựa chọn React giúp dự án phát triển nhanh chóng giao diện người dùng, dễ dàng tích hợp các hệ thống quản lý state linh hoạt như Context API hay Redux Toolkit và dễ tuyển dụng nhân sự vận hành.

---

## PHẦN IV: REACT STATE MANAGEMENT & HOOKS (CÂU 31 - 60)

### 31. State trong React là gì?
- **Lý thuyết:** State là một đối tượng dữ liệu đặc biệt được quản lý nội tại bên trong một component React. State chứa thông tin về trạng thái hiện tại của component đó (như trạng thái đóng/mở menu, dữ liệu nhập vào form). Khác với các biến thông thường, khi giá trị của state thay đổi thông qua hàm cập nhật state được React cung cấp, React sẽ lên lịch để re-render component đó nhằm phản ánh sự thay đổi dữ liệu lên giao diện người dùng.
- **Áp dụng thực tế vào dự án PubliCast:** State được dùng để quản lý trạng thái tải dữ liệu `loading` và lỗi `error` khi gọi API giỏ hàng trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) tại dòng 16 và 17.

### 32. Khác nhau giữa State và Props?
- **Lý thuyết:** 
  - **State**: Do chính component tự định nghĩa, thay đổi được từ bên trong (mutable) và đóng vai trò như bộ nhớ cục bộ của component đó.
  - **Props**: Do component cha truyền xuống component con, component con chỉ được phép đọc (read-only) và không thể thay đổi giá trị của props trực tiếp. Thay đổi Props chỉ có thể được thực hiện từ component cha bằng cách truyền một giá trị props mới.
- **Áp dụng thực tế vào dự án PubliCast:** Component cha quản lý state giỏ hàng `cart` và truyền xuống các component con hiển thị thông qua context. Component con nhận data từ `props` để render giao diện tĩnh mà không được phép can thiệp thay đổi trực tiếp biến `cart` này.

### 33. useState hoạt động như thế nào?
- **Lý thuyết:** `useState` là một React Hook nhận vào tham số là giá trị khởi tạo của state và trả về một mảng chứa chính xác 2 phần tử: Phần tử thứ nhất là giá trị hiện tại của state, phần tử thứ hai là một hàm dispatch dùng để cập nhật giá trị mới cho state đó. Khi gọi hàm cập nhật, React sẽ so sánh giá trị mới với giá trị cũ bằng thuật toán `Object.is()`, nếu khác nhau, nó sẽ kích hoạt render lại component.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) dòng 15: `const [cart, setCart] = useState({ items: [], totalAmount: 0 });` khởi tạo state `cart` với giá trị ban đầu là một object chứa mảng rỗng và tổng tiền bằng 0.

### 34. Vì sao setState bất đồng bộ?
- **Lý thuyết:** React thực hiện cơ chế cập nhật state bất đồng bộ (asynchronous) để tối ưu hiệu năng thông qua kỹ thuật gom cụm (Batching). Khi có nhiều lệnh setState được gọi liên tục trong cùng một hàm xử lý sự kiện (event handler), React không re-render component ngay lập tức sau mỗi dòng lệnh. Thay vào đó, nó gom tất cả các lệnh thay đổi state lại và chỉ re-render duy nhất một lần ở cuối event handler để tránh lãng phí hiệu năng vẽ lại DOM.
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng click thêm sản phẩm, nếu ta gọi đồng thời `setCart(newCart)` và `setLoading(false)`, React sẽ gom 2 tác vụ cập nhật này lại và chỉ re-render component đúng một lần để hiển thị UI mới.

### 35. Cách update state dựa trên state cũ?
- **Lý thuyết:** Do tính chất bất đồng bộ của `setState`, việc cập nhật state mới trực tiếp bằng cách tham chiếu đến biến state hiện tại (ví dụ: `setCount(count + 1)`) có thể dẫn đến sai lệch dữ liệu nếu có nhiều lệnh cập nhật diễn ra liên tục. Cách an toàn nhất là truyền một hàm callback vào `setState` nhận tham số đầu vào là giá trị state mới nhất (tiền nhiệm): `setState(prevState => prevState + 1)`.
- **Áp dụng thực tế vào dự án PubliCast:** Khi cập nhật số lượng của một sản phẩm trong giỏ hàng, ta nên dùng callback: `setCart(prevCart => { ... return updatedCart; })` để đảm bảo thao tác dựa trên dữ liệu giỏ hàng mới nhất trong bộ nhớ của React.

### 36. Lifting State Up là gì?
- **Lý thuyết:** Lifting State Up (Nâng trạng thái lên) là kỹ thuật chia sẻ dữ liệu giữa các component không có quan hệ cha-con trực tiếp bằng cách chuyển state dùng chung đó lên component cha chung gần nhất của chúng. Component cha này sẽ quản lý state và truyền dữ liệu đó xuống cho các con dưới dạng props, đồng thời truyền các hàm callback để cho phép các con yêu cầu thay đổi state của cha.
- **Áp dụng thực tế vào dự án PubliCast:** Thay vì để ô tìm kiếm và danh sách hiển thị tự quản lý state riêng biệt, ta đặt state `searchQuery` tại component cha chung (ví dụ `CatalogPage`). Ô nhập liệu sẽ cập nhật state này thông qua callback và danh sách sản phẩm sẽ lọc dữ liệu dựa trên props `searchQuery` nhận từ cha.

### 37. Controlled Component là gì?
- **Lý thuyết:** Là component chứa các thẻ form mà giá trị dữ liệu nhập vào (như thuộc tính `value` của thẻ input) luôn được liên kết trực tiếp với React State, và hành động thay đổi dữ liệu của người dùng luôn được xử lý bởi React thông qua các sự kiện (như `onChange`) để cập nhật state. React là "nguồn sự thật duy nhất" kiểm soát giá trị của form.
- **Áp dụng thực tế vào dự án PubliCast:** Biểu mẫu điền thông tin đăng ký tài khoản sử dụng cấu trúc Controlled:
  ```jsx
  <input value={name} onChange={(e) => setName(e.target.value)} />
  ```

### 38. useReducer dùng khi nào?
- **Lý thuyết:** `useReducer` là một React Hook thay thế cho `useState`, dùng khi component có logic quản lý state phức tạp, có nhiều nhánh rẽ trạng thái phụ thuộc lẫn nhau, hoặc khi state tiếp theo phụ thuộc nhiều vào state trước đó. Nó giúp phân tách logic cập nhật dữ liệu (nằm trong hàm Reducer) ra khỏi component hiển thị UI, giúp code sạch sẽ và dễ viết unit test hơn.
- **Áp dụng thực tế vào dự án PubliCast:** Thích hợp áp dụng cho trang thanh toán (Checkout) phức tạp, nơi state phải quản lý cùng lúc: danh sách sản phẩm mua, phương thức vận chuyển, mã giảm giá áp dụng, thông tin thẻ tín dụng và các trạng thái loading/error của từng bước.

### 39. useState và useReducer khác nhau?
- **Lý thuyết:** 
  - `useState` phù hợp cho các state độc lập, cấu trúc đơn giản (như kiểu dữ liệu nguyên thủy string, number, boolean) hoặc object ít phân cấp. Cực kỳ dễ đọc và viết nhanh.
  - `useReducer` phù hợp cho state phức tạp (nested object, arrays), nhiều hành động tương tác làm thay đổi state theo các cách khác nhau. Giúp cấu trúc code chặt chẽ và tập trung logic thay đổi tại một nơi duy nhất (Reducer).
- **Áp dụng thực tế vào dự án PubliCast:** Dự án ưu tiên dùng `useState` trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) để lưu trữ thông tin giỏ hàng vì cấu trúc dữ liệu giỏ hàng tương đối rõ ràng và các thao tác (thêm, sửa số lượng, xóa) có thể được xử lý gọn gàng bằng các hàm riêng biệt.

### 40. Context API là gì?
- **Lý thuyết:** Context API là một tính năng tích hợp sẵn của React giúp truyền tải dữ liệu (global state) xuyên suốt cây component từ component cha xuống các component con ở rất sâu phía dưới mà không cần phải truyền props thủ công qua từng cấp trung gian (tránh hiện tượng Props Drilling).
- **Áp dụng thực tế vào dự án PubliCast:** Tệp [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) tạo một context thông qua `createContext()` và cung cấp provider `<CartProvider>` bọc quanh ứng dụng, cho phép mọi component ở bất kỳ đâu chỉ cần gọi hook `useCart()` là có thể tương tác với giỏ hàng.

### 41. Props Drilling là gì?
- **Lý thuyết:** Props Drilling là hiện tượng xảy ra khi ta phải truyền dữ liệu (props) đi qua quá nhiều component trung gian trên cây component, mặc dù các component trung gian này hoàn toàn không có nhu cầu sử dụng dữ liệu đó mà chỉ đóng vai trò "chuyển tiếp" props xuống cho component con ở sâu hơn. Điều này khiến mã nguồn trở nên rối rắm, khó bảo trì và dễ xảy ra lỗi.
- **Áp dụng thực tế vào dự án PubliCast:** Hiện tượng này được giải quyết triệt để nhờ việc sử dụng [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) để chia sẻ trực tiếp dữ liệu giỏ hàng tới Header và ProductCard mà không cần truyền props qua các layout trung gian.

### 42. Redux là gì?
- **Lý thuyết:** Redux là một thư viện độc lập quản lý trạng thái ứng dụng theo kiến trúc Flux. Dữ liệu được lưu trữ tập trung tại một đối tượng duy nhất gọi là `Store`. Các component chỉ có thể đọc dữ liệu từ Store và khi muốn thay đổi dữ liệu, chúng bắt buộc phải gửi đi một `Action`. Action này sẽ đi qua các hàm `Reducer` để tạo ra một state mới, từ đó cập nhật lại giao diện.
- **Áp dụng thực tế vào dự án PubliCast:** Redux đóng vai trò quản lý các module mở rộng có nghiệp vụ lớn như quản lý danh mục sản phẩm lớn, hệ thống phân quyền của trang quản trị admin, giúp dữ liệu luôn đồng bộ và nhất quán trên toàn bộ các view của hệ thống.

### 43. Redux Toolkit là gì?
- **Lý thuyết:** Redux Toolkit (RTK) là bộ công cụ tiêu chuẩn, được khuyến nghị để phát triển ứng dụng Redux. RTK giải quyết các vấn đề cấu hình phức tạp của Redux truyền thống bằng cách cung cấp các hàm tiện ích như `configureStore()` (tự động thiết lập middleware và DevTools) và `createSlice()` (tự động tạo action creators và reducers đồng thời, tích hợp sẵn thư viện Immer giúp viết code thay đổi state trực tiếp mà vẫn bảo toàn tính bất biến).
- **Áp dụng thực tế vào dự án PubliCast:** Nếu hệ thống e-commerce mở rộng quy mô, việc cấu hình store bằng Redux Toolkit sẽ giúp giảm thiểu đến 70% lượng code thừa (boilerplate) so với viết Redux core kiểu cũ.

### 44. Global State và Local State khác nhau?
- **Lý thuyết:**
  - **Local State**: Trạng thái chỉ có ý nghĩa và được sử dụng bên trong một component duy nhất hoặc các con trực tiếp của nó (ví dụ: biến trạng thái `showPassword` của form login).
  - **Global State**: Trạng thái được chia sẻ và sử dụng bởi rất nhiều component nằm ở các nhánh khác nhau trên cây component (ví dụ: thông tin người dùng đã đăng nhập, giỏ hàng, cấu hình ngôn ngữ).
- **Áp dụng thực tế vào dự án PubliCast:** Trạng thái mở hay đóng của giỏ hàng là Local State (lưu tại component Header), nhưng danh sách các sản phẩm thực tế đang có trong giỏ hàng là Global State (lưu tại [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx)).

### 45. Khi nào không nên dùng Redux?
- **Lý thuyết:** Không nên dùng Redux khi ứng dụng có quy mô nhỏ hoặc trung bình, dữ liệu ít chia sẻ chéo giữa các màn hình, hoặc các luồng thay đổi trạng thái đơn giản. Việc áp dụng Redux trong trường hợp này sẽ tạo ra lượng code boilerplate không cần thiết và làm tăng độ phức tạp của dự án một cách vô ích.
- **Áp dụng thực tế vào dự án PubliCast:** Với các nghiệp vụ giỏ hàng hiện tại, việc sử dụng React Context kết hợp `useState` là hoàn toàn tối ưu và gọn nhẹ hơn rất nhiều so với thiết lập Store, Reducers, Actions của Redux.

### 46. Zustand là gì?
- **Lý thuyết:** Zustand là một thư viện quản lý state toàn cục siêu nhẹ, nhanh và có thiết kế hiện đại dựa trên React Hooks. Zustand không yêu cầu bọc ứng dụng trong các Context Provider (tránh việc re-render toàn bộ cây component) và không có nhiều boilerplate code như Redux, giúp lập trình viên viết code rất ngắn gọn và đạt hiệu năng tối ưu.
- **Áp dụng thực tế vào dự án PubliCast:** Zustand là một giải pháp thay thế tuyệt vời cho Context API nếu giỏ hàng của dự án PubliCast cần tối ưu hiệu năng render khi số lượng sản phẩm tăng lên hàng trăm item.

### 47. Re-render xảy ra khi nào?
- **Lý thuyết:** React kích hoạt re-render một component khi:
  1. Hàm cập nhật state cục bộ của nó được gọi và giá trị thay đổi.
  2. Component cha trực tiếp của nó bị re-render.
  3. Giá trị props truyền vào component thay đổi.
  4. Component sử dụng một context và giá trị của context đó thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:** Khi API trả về thông tin giỏ hàng mới trong hàm `fetchCart()` tại [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx), state `cart` thay đổi khiến toàn bộ các component tiêu thụ `useCart()` đều được vẽ lại để hiển thị số lượng và tổng tiền mới nhất.

### 48. React.memo dùng để làm gì?
- **Lý thuyết:** `React.memo` là một Higher-Order Component (HOC) dùng để tối ưu hiệu năng của functional component bằng cách ghi nhớ (memoize) kết quả render. Khi component cha bị re-render, React.memo sẽ so sánh các props mới truyền vào component con với các props cũ. Nếu các props không thay đổi (so sánh nông - shallow comparison), React sẽ bỏ qua việc re-render component con này và sử dụng lại kết quả render gần nhất.
- **Áp dụng thực tế vào dự án PubliCast:** Bọc component `ProductCard` trong `React.memo` để tránh việc render lại hàng loạt thẻ sản phẩm khi người dùng chỉ tương tác với các thành phần không liên quan trên thanh bộ lọc (filter sidebar).

### 49. useMemo và useCallback khác gì?
- **Lý thuyết:** 
  - `useMemo` trả về một **giá trị được ghi nhớ** (kết quả của một hàm chạy tính toán).
  - `useCallback` trả về một **hàm được ghi nhớ** (chính bản thân hàm đó để tránh tạo lại vùng nhớ tham chiếu mới ở mỗi lần render).
- **Áp dụng thực tế vào dự án PubliCast:** Dùng `useCallback` cho hàm `addToCart` trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) để khi truyền hàm này xuống các button ở component con, các button đó không bị coi là nhận props mới và tránh re-render không cần thiết.

### 50. Immutable State là gì?
- **Lý thuyết:** Immutable State (Trạng thái bất biến) là nguyên tắc thiết kế yêu cầu không được trực tiếp chỉnh sửa (mutate) dữ liệu của state hiện tại. Khi muốn thay đổi state, ta bắt buộc phải tạo ra một bản sao mới (shallow/deep copy) chứa các thay đổi và gán bản sao đó cho hàm cập nhật state.
- **Áp dụng thực tế vào dự án PubliCast:** Khi cập nhật số lượng của một sản phẩm trong state, ta không ghi đè trực tiếp thuộc tính: `cart.items[0].quantity = 5` mà phải dùng spread operator để tạo mảng mới:
  ```javascript
  setCart(prev => ({ ...prev, items: newItems }));
  ```

### 51. Vì sao React cần immutable?
- **Lý thuyết:** React cần tính bất biến để thực hiện so sánh tham chiếu (reference comparison) cực kỳ nhanh chóng bằng toán tử `===`. Thay vì phải duyệt qua toàn bộ các thuộc tính của một object/mảng phức tạp để kiểm tra xem có gì thay đổi hay không (tốn rất nhiều hiệu năng), React chỉ cần kiểm tra xem địa chỉ ô nhớ của object/mảng đó có thay đổi hay không. Nếu địa chỉ ô nhớ khác, React biết ngay dữ liệu đã đổi và kích hoạt re-render.
- **Áp dụng thực tế vào dự án PubliCast:** Việc duy trì immutable state giúp React nhận biết chính xác khi nào giỏ hàng thay đổi để cập nhật DOM thật một cách chính xác và tối ưu.

### 52. Async State Update là gì?
- **Lý thuyết:** Là hiện tượng cập nhật state xảy ra sau khi một tác vụ bất đồng bộ hoàn thành (như fetch dữ liệu từ API hoặc kết thúc thời gian setTimeout). Cần lưu ý là nếu component đã bị hủy (unmounted) trước khi tác vụ bất đồng bộ hoàn thành, việc gọi cập nhật state có thể gây ra cảnh báo rò rỉ bộ nhớ (memory leak).
- **Áp dụng thực tế vào dự án PubliCast:** Trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) dòng 19, hàm `fetchCart()` gọi API bất đồng bộ bằng `await cartService.getCart()`, sau khi nhận dữ liệu từ server mới tiến hành gọi `setCart(data)` để cập nhật UI.

### 53. Redux Middleware là gì?
- **Lý thuyết:** Redux Middleware là các hàm trung gian nằm ở giữa thời điểm một Action được gửi đi (dispatch) và thời điểm Action đó thực sự chạm tới Reducer. Middleware cho phép ta can thiệp vào luồng xử lý để thực hiện các tác vụ như: ghi log (logging), xử lý các action bất đồng bộ (như gọi API), hoặc hủy bỏ/thay đổi nội dung của Action.
- **Áp dụng thực tế vào dự án PubliCast:** Sử dụng middleware ghi log (như `redux-logger`) trong môi trường phát triển để theo dõi chi tiết mọi thay đổi trạng thái của hệ thống và luồng chuyển đổi dữ liệu.

### 54. Redux Thunk dùng để làm gì?
- **Lý thuyết:** Mặc định Redux chỉ cho phép dispatch các action đồng bộ là một object thuần túy. `Redux Thunk` là một middleware cho phép ta viết các Action Creator trả về một **hàm** (thay vì một object). Hàm này nhận vào hai tham số là `dispatch` và `getState`, cho phép ta thực hiện các tác vụ bất đồng bộ (gọi API) bên trong và dispatch các action đồng bộ khi có kết quả.
- **Áp dụng thực tế vào dự án PubliCast:** Thunk được sử dụng để gọi API đăng nhập phía backend, kiểm tra kết quả, nếu thành công thì dispatch action lưu thông tin người dùng vào store, ngược lại dispatch action báo lỗi.

### 55. Redux Saga khác Thunk thế nào?
- **Lý thuyết:** 
  - `Redux Thunk`: Đơn giản, dễ sử dụng, viết bằng Promises và Async/Await. Phù hợp cho các tác vụ bất đồng bộ quy mô nhỏ và trung bình.
  - `Redux Saga`: Sử dụng tính năng `Generator functions` (ES6) và các helper effects. Cực kỳ mạnh mẽ cho việc quản lý các luồng bất đồng bộ phức tạp, xử lý song song các request, tự động hủy request cũ khi có request mới (takeLatest), giúp code bất đồng bộ trông giống như đồng bộ và rất dễ viết test.
- **Áp dụng thực tế vào dự án PubliCast:** Thường được cấu hình cho các hệ thống thanh toán phức tạp cần kiểm soát chặt chẽ luồng giao dịch, retry tự động khi rớt mạng hoặc xử lý đồng thời nhiều sự kiện realtime.

### 56. Persist State là gì?
- **Lý thuyết:** Persist State là kỹ thuật lưu trữ trạng thái của ứng dụng vào bộ nhớ trình duyệt (LocalStorage hoặc SessionStorage) để khi người dùng tải lại trang (reload) hoặc đóng trình duyệt và mở lại, trạng thái đó vẫn được phục hồi lại vào Store thay vì bị reset về giá trị mặc định.
- **Áp dụng thực tế vào dự án PubliCast:** Token xác thực `accessToken` sau khi đăng nhập thành công được lưu vào `localStorage` ở frontend. Khi ứng dụng khởi tạo tại [api.client.js](file:///d:/Fullit/tutorials/PubliCast/frontend/src/services/api.client.js) dòng 14, nó sẽ đọc trực tiếp từ LocalStorage để đính kèm vào Header gửi đi.

### 57. Hydration trong React is là gì?
- **Lý thuyết:** Hydration là quá trình diễn ra ở phía client trong kiến trúc Server-Side Rendering (SSR). Khi trình duyệt tải về mã HTML đã được render sẵn nội dung từ server, React phía client sẽ chạy qua mã HTML đó, đối chiếu với cấu trúc component trong mã JS và gắn các trình lắng nghe sự kiện (event listeners) vào các thẻ HTML tương ứng để trang web trở nên tương tác được (interactive).
- **Áp dụng thực tế vào dự án PubliCast:** Đây là cơ chế nền tảng nếu dự án tích hợp thêm các framework SSR như Next.js để tăng tốc độ SEO cho trang hiển thị danh mục sản phẩm của PubliCast.

### 58. RTK Query là gì?
- **Lý thuyết:** RTK Query là một công cụ mạnh mẽ đi kèm với Redux Toolkit, chuyên biệt cho việc quản lý fetch dữ liệu và caching dữ liệu từ API. Nó tự động hóa toàn bộ việc tạo ra các hooks để fetch dữ liệu, quản lý trạng thái tải (loading, error, success), tự động cache kết quả và invalidation cache khi dữ liệu phía server thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:** RTK Query giúp loại bỏ hoàn toàn việc viết thủ công các useEffect, useState và Axios để fetch thông tin danh mục sản phẩm, giúp code gọn sạch và tối ưu hóa số lượng API request gửi lên server.

### 59. So sánh Redux và Context API?
- **Lý thuyết:**
  - **Context API**: Tích hợp sẵn trong React, dễ học, cấu hình cực nhanh. Tuy nhiên, khi giá trị Context thay đổi, tất cả các component tiêu thụ context đó đều bị re-render (nguy cơ giảm hiệu năng nếu state lớn và thay đổi liên tục).
  - **Redux**: Thư viện ngoài, có độ dốc học tập cao và nhiều boilerplate. Tuy nhiên, nó hỗ trợ tối ưu hóa re-render cực tốt nhờ cơ chế selector (`useSelector`), chỉ re-render component khi phần dữ liệu cụ thể mà component đó quan tâm thực sự thay đổi.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng Context API cho giỏ hàng vì quy mô giỏ hàng nhỏ và số lượng component cần re-render ít, giúp tiết kiệm thời gian phát triển và giảm dung lượng gói bundle.

### 60. Bạn sẽ chọn state management nào cho project?
- **Lý thuyết:** Việc chọn lựa phụ thuộc vào: quy mô ứng dụng, mức độ phức tạp của luồng dữ liệu và năng lực của đội ngũ phát triển. Dự án nhỏ dùng `useState/useContext`. Dự án lớn có nhiều module tương tác chéo chọn `Redux Toolkit` hoặc `Zustand` để đảm bảo hiệu năng và tính mở rộng.
- **Áp dụng thực tế vào dự án PubliCast:** Sự kết hợp giữa Local State (`useState`) cho các tương tác biểu mẫu và Context API (`CartContext`) cho luồng dữ liệu giỏ hàng dùng chung là sự lựa chọn hợp lý nhất cho quy mô hiện tại của PubliCast.

---

## PHẦN V: REDIS CACHE, STORAGE & REALTIME SYSTEM (CÂU 61 - 92)

### 61. Redis là gì?
- **Lý thuyết:** Redis (Remote Dictionary Server) là một kho lưu trữ cấu trúc dữ liệu in-memory (trong bộ nhớ RAM) mã nguồn mở, được sử dụng làm cơ sở dữ liệu, bộ nhớ đệm (cache), message broker hoặc hàng đợi (queue). Redis hỗ trợ nhiều cấu trúc dữ liệu khác nhau như Strings, Hashes, Lists, Sets, Sorted Sets với tốc độ đọc ghi cực nhanh (dưới 1 mili-giây).
- **Áp dụng thực tế vào dự án PubliCast:** Được cấu hình trong [redis.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/config/redis.js) để làm bộ nhớ đệm lưu trữ mã OTP xác thực đăng ký tài khoản và lưu trữ tạm thời Refresh Token của phiên làm việc người dùng.

### 62. Redis khác MySQL/MongoDB thế nào?
- **Lý thuyết:** 
  - **MySQL/MongoDB**: Lưu trữ dữ liệu chính xuống ổ đĩa cứng (HDD/SSD). Dữ liệu được bảo toàn bền vững ngay cả khi mất điện hoặc server restart, nhưng tốc độ đọc ghi bị giới hạn bởi tốc độ I/O của ổ đĩa.
  - **Redis**: Lưu trữ toàn bộ dữ liệu trực tiếp trên RAM. Tốc độ truy xuất nhanh hơn hàng trăm lần so với ổ đĩa, nhưng dung lượng lưu trữ bị giới hạn bởi dung lượng RAM của máy chủ và dữ liệu có thể bị mất nếu RAM bị xóa (nếu không bật tính năng Persistence).
- **Áp dụng thực tế vào dự án PubliCast:** MongoDB lưu trữ dữ liệu bền vững của người dùng (`User`), trong khi Redis lưu trữ dữ liệu nóng, tồn tại ngắn hạn như OTP đăng ký (hết hạn sau 10 phút) nhằm tối ưu hóa bộ nhớ và tốc độ truy xuất.

### 63. Vì sao Redis nhanh?
- **Lý thuyết:** Redis đạt được hiệu năng cực cao nhờ ba yếu tố chính:
  1. **In-Memory**: Mọi thao tác dữ liệu đều thực hiện trực tiếp trên RAM, không tốn thời gian tìm kiếm trên đĩa.
  2. **Single-Threaded**: Redis sử dụng kiến trúc đơn luồng cho các thao tác I/O dữ liệu, giúp tránh được việc tranh chấp tài nguyên (race conditions), không tốn chi phí chuyển ngữ cảnh luồng (context switching) và khóa dữ liệu (locking).
  3. **Non-blocking I/O multiplexing**: Sử dụng cơ chế phục vụ nhiều kết nối đồng thời một cách hiệu quả dựa trên Event Loop của hệ điều hành.
- **Áp dụng thực tế vào dự án PubliCast:** Đảm bảo thời gian phản hồi của API xác thực OTP và đăng nhập luôn dưới mức 50ms, cải thiện trải nghiệm đăng ký tài khoản của người dùng.

### 64. Redis thường dùng để làm gì?
- **Lý thuyết:** Các ứng dụng phổ biến nhất của Redis bao gồm:
  - **Caching**: Lưu kết quả của các truy vấn DB nặng để trả về ngay cho request sau.
  - **Session Store**: Quản lý trạng thái đăng nhập của người dùng tập trung trong hệ thống chạy nhiều server.
  - **Rate Limiting**: Giới hạn số lượng request từ một IP để chống spam/DDOS.
  - **Message Queue**: Sử dụng Pub/Sub hoặc Redis Streams để chuyển tiếp tin nhắn realtime.
- **Áp dụng thực tế vào dự án PubliCast:** Redis được dùng làm Session Store để lưu trữ Refresh Token bảo mật và thực hiện tính năng throttling (giới hạn thời gian gửi lại mã OTP tối thiểu 60 giây một lần).

### 65. Cache là gì?
- **Lý thuyết:** Caching (Bộ nhớ đệm) là kỹ thuật lưu trữ tạm thời một bản sao của dữ liệu tại một nơi truy xuất nhanh hơn (như RAM) để phục vụ cho các yêu cầu truy cập tiếp theo một cách nhanh chóng, giúp giảm tải công việc tính toán hoặc truy vấn cho hệ thống lưu trữ chính phía sau (như Database).
- **Áp dụng thực tế vào dự án PubliCast:** Hệ thống có thể cache danh sách các danh mục sản phẩm (Categories) vốn ít khi thay đổi vào Redis để tránh việc mỗi lượt truy cập trang chủ của khách hàng đều phải thực hiện câu lệnh `find()` vào MongoDB.

### 66. TTL trong Redis là gì?
- **Lý thuyết:** TTL (Time To Live) là thời gian sống của một key trong Redis. Khi thiết lập TTL cho một key, Redis sẽ tự động đếm ngược thời gian và xóa bỏ key đó ra khỏi bộ nhớ RAM khi hết thời gian quy định. TTL giúp quản lý bộ nhớ RAM hiệu quả, tự động dọn dẹp các dữ liệu tạm thời mà không cần viết các tiến trình quét rác thủ công.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [otp.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/otp.service.js) dòng 8, hàm `saveOTP()` thiết lập TTL mặc định là 600 giây (10 phút) cho mã OTP để đảm bảo mã tự động vô hiệu hóa sau thời gian này.

### 67. Redis Data Types gồm gì?
- **Lý thuyết:** Redis hỗ trợ các kiểu dữ liệu cốt lõi:
  - **String**: Lưu trữ chuỗi văn bản, số, hoặc JSON string hóa (dung lượng tối đa 512MB).
  - **Hash**: Bản đồ (map) lưu các cặp key-value, rất thích hợp lưu trữ đối tượng.
  - **List**: Danh sách liên kết các chuỗi, hỗ trợ thao tác đẩy/rút từ hai đầu (Queue/Stack).
  - **Set**: Tập hợp các chuỗi không trùng lặp và không có thứ tự.
  - **Sorted Set**: Tập hợp các chuỗi không trùng lặp, mỗi phần tử đi kèm một điểm số (score) dùng để sắp xếp thứ tự.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng kiểu dữ liệu `String` để lưu mã OTP dưới dạng key `otp:${email}` chứa giá trị mã OTP 6 số.

### 68. String trong Redis dùng khi nào?
- **Lý thuyết:** Được dùng khi cần lưu trữ các giá trị đơn giản như bộ đếm (counter), chuỗi HTML đã được render sẵn, token xác thực, hoặc toàn bộ một object được chuyển đổi sang định dạng JSON string. Kiểu String hỗ trợ các thao tác nguyên tử như tăng/giảm số (`INCR`, `DECR`).
- **Áp dụng thực tế vào dự án PubliCast:** Dùng để đếm số lần nhập sai OTP reset mật khẩu của người dùng thông qua lệnh `redisClient.incr()` trong [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) tại dòng 300.

### 69. Hash trong Redis dùng khi nào?
- **Lý thuyết:** Được dùng khi cần lưu trữ một đối tượng có nhiều thuộc tính (fields) riêng biệt (ví dụ: thông tin người dùng gồm name, age, email). Hash giúp tiết kiệm không gian bộ nhớ hơn so với việc lưu trữ nhiều key String riêng lẻ và cho phép đọc/ghi hoặc cập nhật từng thuộc tính cụ thể của đối tượng mà không cần serialize lại toàn bộ đối tượng.
- **Áp dụng thực tế vào dự án PubliCast:** Thích hợp dùng để lưu trữ metadata của phiên làm việc của người dùng (như thiết bị truy cập, thời gian hoạt động cuối cùng).

### 70. Redis Pub/Sub là gì?
- **Lý thuyết:** Pub/Sub (Publish/Subscribe) là một mô hình truyền tin nhắn (messaging pattern) trong đó người gửi tin (Publisher) không lập trình để gửi tin trực tiếp đến người nhận cụ thể (Subscriber). Thay vào đó, Publisher xuất bản tin nhắn vào một kênh chung (Channel). Những Subscriber đăng ký lắng nghe kênh đó sẽ nhận được tin nhắn ngay lập tức theo thời gian thực.
- **Áp dụng thực tế vào dự án PubliCast:** Được ứng dụng để đồng bộ thông tin đơn hàng mới hoặc thông báo hệ thống realtime giữa nhiều instance backend Node.js khác nhau khi hệ thống được scale chạy đa server.

### 71. Redis Queue là gì?
- **Lý thuyết:** Là cấu trúc hàng đợi xử lý công việc bất đồng bộ được xây dựng bằng cách sử dụng kiểu dữ liệu `List` của Redis kết hợp các câu lệnh đẩy phần tử vào hàng đợi (`LPUSH`) và rút phần tử ra khỏi hàng đợi (`RPOP` hoặc câu lệnh blocking `BRPOP`). Giúp phân tách tiến trình xử lý request và tiến trình chạy tác vụ nặng (Background Job).
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng đăng ký tài khoản thành công, hệ thống đẩy sự kiện gửi email vào Redis Queue. Một tiến trình worker chạy ngầm sẽ lấy nhiệm vụ ra và gửi email, tránh làm tăng thời gian chờ của người dùng khi gọi API đăng ký.

### 72. Session trong Redis là gì?
- **Lý thuyết:** Là việc sử dụng Redis làm nơi lưu trữ tập trung thông tin phiên làm việc (session data) của toàn bộ người dùng đang đăng nhập vào hệ thống. Việc này đặc biệt quan trọng trong kiến trúc đa máy chủ chạy sau một Load Balancer, giúp người dùng không bị mất trạng thái đăng nhập khi request của họ được chuyển sang một máy chủ khác (Session Sharing).
- **Áp dụng thực tế vào dự án PubliCast:** Backend lưu trữ trạng thái hoạt động của Refresh Token của người dùng trong Redis dưới dạng key `refresh:${userId}`. Khi kiểm tra phiên, backend truy vấn trực tiếp vào Redis thay vì đọc database MongoDB.

### 73. Redis Persistence là gì?
- **Lý thuyết:** Là các cơ chế ghi dữ liệu từ RAM xuống ổ đĩa cứng của Redis để đảm bảo dữ liệu không bị mất hoàn toàn khi hệ thống mất điện hoặc restart. Redis hỗ trợ hai cơ chế:
  - **RDB (Redis Database)**: Chụp lại toàn bộ trạng thái dữ liệu tại một thời điểm (snapshot) và ghi xuống đĩa sau các khoảng thời gian cấu hình. Rất nhanh khi khởi động lại nhưng có rủi ro mất dữ liệu của vài phút cuối.
  - **AOF (Append Only File)**: Ghi lại mọi câu lệnh ghi dữ liệu vào một file log trên đĩa. An toàn dữ liệu cao hơn nhưng file log nhanh chóng phình to và thời gian phục hồi lâu hơn.
- **Áp dụng thực tế vào dự án PubliCast:** Được cấu hình kết hợp cả RDB và AOF trong môi trường Production để bảo toàn dữ liệu giỏ hàng tạm thời và token xác thực của khách hàng.

### 74. Redis có nhược điểm gì?
- **Lý thuyết:** Nhược điểm lớn nhất là tốn kém chi phí phần cứng vì dữ liệu lưu hoàn toàn trên RAM (đắt hơn nhiều so với ổ cứng). Nếu dung lượng dữ liệu vượt quá dung lượng RAM vật lý, server sẽ bị lỗi tràn bộ nhớ (Out of Memory) hoặc phải kích hoạt thuật toán xóa dữ liệu cũ (Eviction Policy). Ngoài ra, do kiến trúc đơn luồng, một câu lệnh truy vấn dữ liệu quá nặng (như `KEYS *`) có thể block toàn bộ server Redis.
- **Áp dụng thực tế vào dự án PubliCast:** Để hạn chế nhược điểm này, dự án chỉ lưu dữ liệu có dung lượng nhỏ (token, mã OTP 6 số) và luôn thiết lập thời gian hết hạn TTL hợp lý cho mọi key để tự giải phóng bộ nhớ RAM.

### 75. Rate Limiting bằng Redis?
- **Lý thuyết:** Là kỹ thuật giới hạn số lượng request tối đa mà một IP hoặc một User được phép gửi tới API trong một khoảng thời gian nhất định (ví dụ: tối đa 5 request đăng nhập/phút) để ngăn chặn spam, brute-force mật khẩu hoặc tấn công từ chối dịch vụ (DDoS). Redis thực hiện việc này bằng cách sử dụng bộ đếm (`INCR`) kết hợp đặt TTL cho key đại diện cho IP/User đó.
- **Áp dụng thực tế vào dự án PubliCast:** Được triển khai trong [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) tại hàm `resendOTP()` dòng 93: Sử dụng key throttling `resend-otp-throttle:${email}` đặt TTL 60 giây để ngăn người dùng spam click liên tục nút gửi lại OTP.

### 76. Cache Aside Pattern là gì?
- **Lý thuyết:** Cache Aside (hay Lazy Loading) là mô hình hoạt động: Khi ứng dụng cần dữ liệu, trước tiên nó sẽ kiểm tra trong Cache (Redis). Nếu dữ liệu tồn tại (Cache Hit), trả về ngay lập tức. Nếu dữ liệu không tồn tại (Cache Miss), ứng dụng sẽ truy vấn từ Database chính, trả dữ liệu về cho client, đồng thời ghi dữ liệu đó vào Cache kèm TTL để phục vụ cho các request tiếp theo.
- **Áp dụng thực tế vào dự án PubliCast:** Thích hợp áp dụng cho API lấy thông tin chi tiết của một sản phẩm: check Redis -> không có -> đọc MongoDB -> trả về client và ghi đè vào Redis cache với TTL 1 giờ.

### 77. Cache Invalidation là gì?
- **Lý thuyết:** Cache Invalidation (Hủy hiệu lực cache) là quá trình xóa bỏ hoặc cập nhật dữ liệu trong Cache khi dữ liệu tương ứng trong Database chính có sự thay đổi (thêm, sửa, xóa). Đây là một trong những bài toán khó nhất của Caching để đảm bảo tính nhất quán dữ liệu (Data Consistency) giữa cache và DB.
- **Áp dụng thực tế vào dự án PubliCast:** Khi Admin cập nhật giá của một sản phẩm, backend phải thực hiện xóa (delete) key cache của sản phẩm đó trong Redis để ở lượt truy cập tiếp theo, hệ thống sẽ đọc giá mới từ MongoDB và cập nhật lại cache.

### 78. Redis Cluster là gì?
- **Lý thuyết:** Redis Cluster là giải pháp mở rộng quy mô (scaling) hệ thống Redis theo chiều ngang bằng cách phân chia dữ liệu (sharding) tự động trên nhiều node Redis độc lập. Dữ liệu được chia đều vào 16384 hash slots. Cluster giúp hệ thống tiếp tục hoạt động bình thường ngay cả khi một số node bị lỗi nhờ cơ chế nhân bản (replication) và tự động bầu chọn node master mới.
- **Áp dụng thực tế vào dự án PubliCast:** Được triển khai ở hạ tầng hệ thống khi lượng truy cập e-commerce tăng đột biến lên hàng triệu lượt xem sản phẩm mỗi ngày, giúp phân tải truy vấn RAM hiệu quả.

### 79. Redis Sentinel là gì?
- **Lý thuyết:** Redis Sentinel là hệ thống giám sát và đảm bảo tính sẵn sàng cao (High Availability) cho kiến trúc Redis Master-Slave (không phân mảnh dữ liệu như Cluster). Sentinel liên tục kiểm tra sức khỏe của Master Node, nếu Master bị crash, Sentinel sẽ tự động kích hoạt quá trình failover: quảng bá một Slave Node lên làm Master mới và cấu hình lại các node còn lại hướng về Master mới này.
- **Áp dụng thực tế vào dự án PubliCast:** Đảm bảo hệ thống giỏ hàng của PubliCast hoạt động liên tục 24/7 mà không bị gián đoạn dịch vụ nếu server Redis chính gặp sự cố phần cứng.

### 80. Khi nào không nên dùng Redis?
- **Lý thuyết:** Không nên dùng Redis khi: dữ liệu cần lưu trữ có dung lượng cực lớn và ít khi truy xuất (lưu trên RAM sẽ vô cùng lãng phí); dữ liệu yêu cầu các mối quan hệ phức tạp và các câu lệnh truy vấn lồng nhau (JOIN); hoặc dữ liệu đòi hỏi các giao dịch tài chính cực kỳ nghiêm ngặt của cơ sở dữ liệu quan hệ SQL truyền thống.
- **Áp dụng thực tế vào dự án PubliCast:** Không dùng Redis để lưu trữ toàn bộ lịch sử đơn hàng qua nhiều năm của khách hàng. Dữ liệu này được lưu trữ bền vững trong MongoDB.

### 81. React frontend dùng Redis trực tiếp không?
- **Lý thuyết:** **Không bao giờ**. React chạy trực tiếp trên trình duyệt của người dùng cuối. Việc kết nối trực tiếp từ React tới Redis đòi hỏi phải mở cổng kết nối Redis ra internet và lộ thông tin cấu hình (password kết nối), tạo điều kiện cho hacker phá hủy dữ liệu. Mọi tương tác của frontend tới Redis bắt buộc phải đi qua một lớp API bảo mật của Backend ExpressJS.
- **Áp dụng thực tế vào dự án PubliCast:** Client React gửi request HTTP tới các endpoint trong [routes.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/routes.jsx), backend ExpressJS tiếp nhận request, xác thực quyền hạn và sử dụng thư viện `redis` nội bộ để giao tiếp với Redis server.

### 82. Redis thường kết hợp React để làm gì?
- **Lý thuyết:** Sự kết hợp này mang lại trải nghiệm người dùng (UX) cực kỳ mượt mà. Backend sử dụng Redis để cache dữ liệu API giúp giảm thiểu độ trễ phản hồi (latency). Khi React gọi API, dữ liệu được trả về gần như ngay lập tức, giúp giao diện người dùng hiển thị tức thì mà không cần hiển thị các vòng xoay loading quá lâu.
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng chuyển trang danh mục sản phẩm, nhờ dữ liệu đã được cache sẵn trong Redis tại backend, danh sách sản phẩm hiển thị trên giao diện React ngay lập tức mà không có độ trễ truy vấn database.

### 83. React login với Redis session hoạt động sao?
- **Lý thuyết:** Luồng hoạt động:
  1. React gửi thông tin đăng nhập lên Express API.
  2. Backend kiểm tra password trong DB. Nếu đúng, tạo session ID ngẫu nhiên hoặc dùng Refresh Token làm session key.
  3. Backend lưu session data vào Redis với key là session key và đặt TTL.
  4. Backend trả session key về cho React qua HttpOnly Cookie.
  5. Ở các request sau, trình duyệt tự gửi cookie chứa session key lên, backend kiểm tra sự tồn tại của session key trong Redis để xác định trạng thái đăng nhập.
- **Áp dụng thực tế vào dự án PubliCast:** Quy trình này được áp dụng thông qua việc lưu Hash của Refresh Token vào Redis bằng key `refresh:${userId}` tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 72.

### 84. Redis giúp React app nhanh hơn thế nào?
- **Lý thuyết:** Giúp giảm thời gian tải trang đầu tiên và tăng tốc độ chuyển đổi nội dung. Bằng cách giảm tải thời gian xử lý của các API nặng tại backend (từ hàng trăm ms xuống dưới 5ms nhờ cache RAM), React App nhận được dữ liệu cực kỳ nhanh để render ra giao diện cho người dùng.
- **Áp dụng thực tế vào dự án PubliCast:** Tốc độ phản hồi trang giỏ hàng tại [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) được tối ưu hóa tối đa nhờ dữ liệu giỏ hàng tạm được truy xuất trực tiếp từ RAM của Redis.

### 85. React realtime chat dùng Redis như thế nào?
- **Lý thuyết:** Trong hệ thống chat realtime chạy nhiều server backend, khi Client A gửi tin nhắn tới Server 1 và Client B kết nối tới Server 2. Để tin nhắn truyền được từ Server 1 sang Server 2, ta sử dụng tính năng `Redis Pub/Sub`. Server 1 xuất bản tin nhắn lên một channel của Redis, Server 2 đăng ký lắng nghe channel này sẽ nhận được tin nhắn và đẩy xuống Client B qua kết nối WebSocket.
- **Áp dụng thực tế vào dự án PubliCast:** Hỗ trợ xây dựng tính năng tư vấn khách hàng realtime (Live Chat) giữa người mua hàng tại giao diện React và nhân viên quản trị ở trang Admin.

### 86. Redis với Socket.IO dùng để làm gì?
- **Lý thuyết:** Khi scale hệ thống sử dụng Socket.IO lên nhiều server chạy sau một Load Balancer, các kết nối Socket của người dùng bị phân tán trên các server khác nhau. Để các server có thể trao đổi sự kiện và gửi tin nhắn chéo cho các socket kết nối ở server khác, ta sử dụng `Socket.IO Redis Adapter`. Adapter này sử dụng Redis Pub/Sub để đồng bộ và chuyển tiếp các sự kiện socket giữa các máy chủ một cách tự động.
- **Áp dụng thực tế vào dự án PubliCast:** Đồng bộ trạng thái đơn hàng mới được tạo từ client tới bảng điều khiển quản trị của Admin trong thời gian thực.

### 87. Vì sao cache API cho React app?
- **Lý thuyết:** Nhằm tối ưu hóa hiệu năng hệ thống toàn diện: giảm thiểu số lượng câu lệnh truy vấn tốn kém tài nguyên vào Database chính, giảm băng thông mạng truyền tải giữa server và client, và quan trọng nhất là loại bỏ hoàn toàn hiện tượng giao diện bị giật lag hoặc trống thông tin khi đợi dữ liệu API phản hồi.
- **Áp dụng thực tế vào dự án PubliCast:** Cache dữ liệu danh mục sản phẩm giúp trang chủ React hiển thị ngay lập tức bộ lọc danh mục cho người dùng mà không cần chờ Mongoose kết nối và quét qua bảng dữ liệu trong MongoDB.

### 88. Ví dụ cache Express API bằng Redis
- **Lý thuyết:** Middleware kiểm tra sự tồn tại của key cache (tính từ URL request):
  ```javascript
  const cacheMiddleware = async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    res.sendResponse = res.json;
    res.json = (body) => {
      redisClient.setEx(key, 3600, JSON.stringify(body));
      res.sendResponse(body);
    };
    next();
  };
  ```
- **Áp dụng thực tế vào dự án PubliCast:** Áp dụng middleware này cho các route API lấy danh mục sản phẩm trong [category.routes.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/routes/category.routes.js) để tăng tốc độ tải trang.

### 89. Redis và JWT liên quan gì?
- **Lý thuyết:** Mặc dù bản chất JWT là stateless, nhưng để giải quyết bài toán thu hồi token (Revocation) trước khi hết hạn (ví dụ: khi người dùng đăng xuất, bị khóa tài khoản hoặc đổi mật khẩu), ta cần lưu trữ danh sách các token bị thu hồi (Blacklist) hoặc trạng thái hoạt động của Refresh Token vào Redis. Do Redis truy xuất cực nhanh, việc kiểm tra token hợp lệ ở mỗi request sẽ không làm ảnh hưởng đến hiệu năng hệ thống.
- **Áp dụng thực tế vào dự án PubliCast:** Triển khai lưu trữ Refresh Token bảo mật trong Redis tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 72. Khi người dùng click đăng xuất, hệ thống chỉ cần xóa key tương ứng trong Redis để vô hiệu hóa phiên làm việc ngay lập tức.

### 90. Làm sao tránh cache stampede?
- **Lý thuyết:** Cache Stampede (hay Cache Avalanche) xảy ra khi một key cache cực kỳ phổ biến (hot key) bị hết hạn đúng lúc hệ thống đang có hàng vạn request đồng thời truy cập. Lúc này, tất cả các request đều gặp Cache Miss và cùng lúc gửi truy vấn xuống Database chính, khiến DB bị quá tải và crash (sập nguồn). Cách phòng chống: Sử dụng cơ chế khóa phân tán (Distributed Lock - như Redlock) để chỉ cho phép duy nhất một request được phép xuống DB lấy dữ liệu và cập nhật lại cache, các request khác phải đợi cho đến khi cache có lại dữ liệu.
- **Áp dụng thực tế vào dự án PubliCast:** Đảm bảo hệ thống không bị sập nguồn khi danh sách sản phẩm hot sale hết hạn cache đúng khung giờ vàng khuyến mãi của trang web.

### 91. Cache warming là gì?
- **Lý thuyết:** Cache Warming (Làm ấm bộ nhớ đệm) là kỹ thuật chủ động truy vấn các dữ liệu phổ biến, quan trọng từ Database và nạp sẵn (pre-load) vào Redis Cache ngay khi server vừa khởi động (startup), trước khi hệ thống bắt đầu đón nhận request thực tế từ người dùng. Tránh hiện tượng các request đầu tiên bị chậm do gặp Cache Miss.
- **Áp dụng thực tế vào dự án PubliCast:** Khi server backend boot thành công, hệ thống tự động chạy một script quét qua các sản phẩm bán chạy nhất và nạp thông tin của chúng vào Redis cache.

### 92. Làm sao scale Redis?
- **Lý thuyết:** Hai phương án chính:
  - **Scale theo chiều dọc (Vertical Scaling)**: Nâng cấp dung lượng RAM và CPU cho server chạy Redis hiện tại. Đơn giản nhưng bị giới hạn bởi giới hạn vật lý của máy chủ.
  - **Scale theo chiều ngang (Horizontal Scaling)**: Sử dụng Redis Cluster để phân mảnh dữ liệu trên nhiều server RAM nhỏ, hoặc thiết lập mô hình Master-Slave kết hợp Sentinel để phân tách luồng ghi (vào Master) và luồng đọc (vào Slaves).
- **Áp dụng thực tế vào dự án PubliCast:** Cấu hình hệ thống backend kết nối tới cụm Redis Cluster trong môi trường đám mây (cloud) để đáp ứng hàng chục triệu request cache mỗi ngày.

---

## PHẦN VI: NODE.JS INTERNALS, ASYNC/AWAIT & ARCHITECTURE (CÂU 93 - 113)

### 93. Node.js là gì?
- **Lý thuyết:** Node.js là một môi trường chạy mã JavaScript ngoài trình duyệt (JavaScript runtime environment) mã nguồn mở và đa nền tảng, được xây dựng trên engine JavaScript V8 của Google Chrome. Node.js sử dụng kiến trúc hướng sự kiện (event-driven) và mô hình I/O không chặn (non-blocking I/O) giúp xây dựng các ứng dụng mạng có khả năng mở rộng cực cao.
- **Áp dụng thực tế vào dự án PubliCast:** Node.js làm nền tảng chạy toàn bộ ứng dụng Backend. Các mã nguồn JavaScript ở thư mục `backend/src/` được thông dịch và thực thi trực tiếp bởi Node.js runtime.

### 94. Vì sao Node.js nhanh?
- **Lý thuyết:** Node.js đạt hiệu năng xử lý request ấn tượng nhờ:
  1. **Engine V8**: Biên dịch trực tiếp mã JavaScript sang mã máy cực nhanh.
  2. **Non-blocking I/O**: Các thao tác đọc ghi ổ đĩa, truy vấn mạng không bắt luồng xử lý chính phải dừng lại chờ đợi mà chạy bất đồng bộ ngầm.
  3. **Event Loop**: Quản lý và điều phối các sự kiện bất đồng bộ một cách tối ưu trên một luồng duy nhất.
- **Áp dụng thực tế vào dự án PubliCast:** Server có khả năng tiếp nhận đồng thời nhiều request đặt hàng hoặc đăng ký tài khoản mà không cần cấp phát tài nguyên luồng (thread) mới cho mỗi request, giúp tiết kiệm bộ nhớ RAM tối đa.

### 95. Event Loop là gì?
- **Lý thuyết:** Là thành phần trung tâm của Node.js, liên tục chạy trong một vòng lặp vô hạn để kiểm tra xem Call Stack có rỗng không. Nếu rỗng, nó sẽ lấy các callback của các tác vụ I/O bất đồng bộ đã hoàn thành từ Callback Queue và đẩy vào Call Stack để thực thi. Event Loop chia quá trình xử lý thành các pha rõ rệt: Timers, Pending Callbacks, Idle/Prepare, Poll, Check, Close Callbacks.
- **Áp dụng thực tế vào dự án PubliCast:** Quản lý việc thực thi các callback sau khi nhận được dữ liệu từ MongoDB trong các câu lệnh truy vấn Mongoose bất đồng bộ.

### 96. Blocking và Non-blocking khác nhau?
- **Lý thuyết:** 
  - **Blocking (Chặn)**: Tiến trình thực thi mã nguồn JavaScript tiếp theo phải dừng lại và chờ cho đến khi một tác vụ I/O (ví dụ: đọc file từ đĩa bằng hàm sync `readFileSync`) hoàn thành.
  - **Non-blocking (Không chặn)**: Tiến trình JavaScript kích hoạt tác vụ I/O (ví dụ bằng hàm async `readFile`) và tiếp tục chạy ngay các dòng code phía dưới mà không đợi. Khi tác vụ I/O chạy xong, hệ thống sẽ gửi một sự kiện kèm callback để xử lý kết quả sau.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng hoàn toàn mã nguồn non-blocking với cú pháp async/await cho các thao tác lưu dữ liệu bằng Mongoose và đọc dữ liệu từ Redis.

### 97. Callback là gì?
- **Lý thuyết:** Callback là một hàm (function) được truyền làm đối số (argument) vào một hàm khác, với mục đích sẽ được hàm đó kích hoạt và thực thi tại một thời điểm cụ thể sau khi một hành động hoặc một tác vụ nào đó hoàn thành.
- **Áp dụng thực tế vào dự án PubliCast:** Sử dụng callback trong định nghĩa middleware đơn giản tại [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) dòng 14:
  ```javascript
  app.use((req, res, next) => { ... next(); });
  ```
  Hàm `next` chính là một callback để báo cho Express biết middleware đã hoàn thành và có thể chuyển tiếp.

### 98. Callback Hell là gì?
- **Lý thuyết:** Callback Hell (còn gọi là Pyramid of Doom) là hiện tượng mã nguồn trở nên cực kỳ khó đọc, khó bảo trì và dễ phát sinh lỗi khi ta lồng nhiều hàm callback bất đồng bộ vào nhau quá sâu. Điều này xảy ra khi các tác vụ bất đồng bộ tiếp theo phụ thuộc hoàn toàn vào kết quả trả về của tác vụ bất đồng bộ trước đó.
- **Áp dụng thực tế vào dự án PubliCast:** Tránh hoàn toàn lỗi này bằng cách sử dụng `Promise` kết hợp cú pháp `async/await` hiện đại trong các phương thức của [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js), giúp code bất đồng bộ trông thẳng hàng và dễ đọc như code đồng bộ.

### 99. Promise là gì?
- **Lý thuyết:** Promise là một đối tượng đại diện cho sự hoàn thành (hoặc thất bại) của một tác vụ bất đồng bộ trong tương lai và giá trị trả về của nó. Một Promise luôn nằm ở một trong ba trạng thái:
  - `Pending`: Trạng thái đang chờ xử lý, chưa hoàn thành cũng chưa bị từ chối.
  - `Fulfilled`: Tác vụ hoàn thành thành công và trả về kết quả (thông qua hàm `resolve`).
  - `Rejected`: Tác vụ thất bại và trả về nguyên nhân lỗi (thông qua hàm `reject`).
- **Áp dụng thực tế vào dự án PubliCast:** Các truy vấn của Mongoose đến MongoDB như `userRepository.findByEmail()` trả về đối tượng Promise, cho phép lập trình viên sử dụng `.then().catch()` hoặc `await` để hứng kết quả.

### 100. Async/Await là gì?
- **Lý thuyết:** Async/Await là cú pháp đặc biệt (syntactic sugar) được xây dựng trên nền tảng của Promise, giúp viết code bất đồng bộ trông giống như code đồng bộ tuần tự. Từ khóa `async` đặt trước một hàm bắt buộc hàm đó phải trả về một Promise. Từ khóa `await` chỉ được sử dụng bên trong hàm async, có tác dụng tạm dừng thực thi hàm đó để đợi cho đến khi Promise phía sau hoàn thành và trả về kết quả.
- **Áp dụng thực tế vào dự án PubliCast:** Được sử dụng làm chuẩn viết code cho toàn bộ tầng Service và Controller. Ví dụ trong [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 16: `async register(name, email, password) { ... const existingUser = await userRepository.findByEmail(...); ... }`.

### 101. require và import khác nhau?
- **Lý thuyết:**
  - `require` (CommonJS): Là cơ chế nạp module mặc định của Node.js kiểu cũ. Được thực thi đồng bộ tại thời điểm chạy runtime. Module được import bằng cách gán vào một biến.
  - `import` (ES Modules - ESM): Là tiêu chuẩn chính thức của ECMAScript (từ ES6). Được thực thi tĩnh tại thời điểm phân tích code (static analysis) trước khi chạy. Hỗ trợ tối ưu hóa dung lượng file qua cơ chế Tree-shaking.
- **Áp dụng thực tế vào dự án PubliCast:** Backend sử dụng cơ chế CommonJS với `require` do cấu hình `"type": "commonjs"` trong [package.json](file:///d:/Fullit/tutorials/PubliCast/backend/package.json) (dòng 15). Frontend React sử dụng ES Modules với `import` được Vite biên dịch tự động.

### 102. package.json dùng để làm gì?
- **Lý thuyết:** `package.json` là tệp cấu hình cốt lõi của mọi dự án Node.js. Nó chứa các thông tin metadata của dự án (tên, phiên bản, tác giả), định nghĩa các script chạy lệnh (`scripts`), và quản lý danh sách các thư viện phụ thuộc của dự án ở môi trường Production (`dependencies`) và môi trường Development (`devDependencies`).
- **Áp dụng thực tế vào dự án PubliCast:** File [package.json](file:///d:/Fullit/tutorials/PubliCast/backend/package.json) quản lý các thư viện chính như `express`, `mongoose`, `redis`, `jsonwebtoken` và định nghĩa script `"dev": "nodemon src/server.js"` giúp tự động reload server khi code thay đổi trong quá trình dev.

### 103. next() trong middleware là gì?
- **Lý thuyết:** `next` là một tham số (thực chất là một hàm callback) được ExpressJS tự động truyền vào các hàm middleware. Khi được gọi, `next()` sẽ báo hiệu cho Express kết thúc xử lý của middleware hiện tại và chuyển quyền điều hướng request tới middleware kế tiếp trong chuỗi handler đã đăng ký. Nếu không gọi `next()`, request sẽ bị treo vô hạn và trình duyệt của client sẽ bị timeout.
- **Áp dụng thực tế vào dự án PubliCast:** Trong [validation.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/validation.middleware.js) tại dòng 20, sau khi kiểm tra không có lỗi validate dữ liệu đầu vào, hàm `next()` được gọi để cho phép request đi tiếp vào Controller để xử lý nghiệp vụ.

### 104. Express Router là gì?
- **Lý thuyết:** Express Router là một hệ thống định tuyến mini, hoạt động như một middleware độc lập có khả năng tự quản lý các route và controller riêng biệt. Router giúp module hóa cấu trúc định tuyến của ứng dụng thành các tệp tin riêng biệt dựa trên tài nguyên hệ thống, giúp mã nguồn backend sạch sẽ và dễ bảo trì.
- **Áp dụng thực tế vào dự án PubliCast:** Thư mục `backend/src/routes/` chứa các tệp định tuyến riêng cho từng thực thể như `auth.routes.js`, `product.routes.js`, `cart.routes.js`, sau đó toàn bộ các router này được gộp và đăng ký vào app chính tại [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) từ dòng 29 đến 34.

### 105. body-parser là gì?
- **Lý thuyết:** `body-parser` là một middleware của Express dùng để phân tích cú pháp (parse) dữ liệu từ phần thân của HTTP request gửi lên (request body) trước khi nó đi vào controller, và gán dữ liệu đã parse đó vào đối tượng `req.body`. Từ Express 4.16.0+, các tính năng của body-parser đã được tích hợp sẵn trực tiếp vào Express.
- **Áp dụng thực tế vào dự án PubliCast:** Cấu hình trong [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) tại dòng 24 và 25: `app.use(express.json())` để parse dữ liệu dạng JSON và `app.use(express.urlencoded({ extended: true }))` để parse dữ liệu dạng form-submit thông thường.

### 106. bcrypt dùng để làm gì?
- **Lý thuyết:** `bcrypt` (hoặc `bcryptjs`) là thư viện mã hóa một chiều, chuyên biệt cho việc băm mật khẩu người dùng (password hashing). Bcrypt tự động kết hợp thêm kỹ thuật Salt (thêm một chuỗi ngẫu nhiên vào mật khẩu trước khi băm) và thuật toán làm chậm thời gian xử lý (key stretching) để chống lại các cuộc tấn công tra cứu bảng cầu vồng (rainbow table) hoặc tấn công brute-force phần cứng tốc độ cao.
- **Áp dụng thực tế vào dự án PubliCast:** Khi đăng ký tài khoản mới tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 25, mật khẩu được băm an toàn qua hàm `bcrypt.hash(password, 10)` trước khi lưu trữ vào MongoDB.

### 107. Hash và Encrypt khác nhau?
- **Lý thuyết:**
  - **Hash (Băm)**: Là quá trình biến đổi dữ liệu thành một chuỗi ký tự có độ dài cố định. Đây là phép toán **một chiều** (one-way); về mặt lý thuyết không thể giải mã ngược chuỗi băm để lấy lại dữ liệu gốc. Phù hợp lưu trữ mật khẩu.
  - **Encrypt (Mã hóa)**: Là quá trình biến đổi dữ liệu thành mật mã bằng một thuật toán và một khóa (key). Đây là phép toán **hai chiều** (two-way); dữ liệu mã hóa có thể được giải mã lại thành dữ liệu gốc nếu có khóa giải mã phù hợp. Phù hợp truyền dữ liệu nhạy cảm qua mạng.
- **Áp dụng thực tế vào dự án PubliCast:** Mật khẩu của người dùng được băm (hash) bằng `bcrypt`, trong khi thông tin token JWT được mã hóa và ký số (signature) để có thể giải mã và xác thực lại ở mỗi request tại [jwt.utils.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/utils/jwt.utils.js).

### 108. Xử lý lỗi Express như thế nào?
- **Lý thuyết:** ExpressJS quản lý lỗi tập trung bằng cách sử dụng một loại middleware đặc biệt có cấu trúc **chính xác 4 tham số đầu vào**: `(err, req, res, next)`. Middleware xử lý lỗi này phải được khai báo ở cuối cùng của tệp cấu hình ứng dụng, sau toàn bộ các route định tuyến API. Khi bất kỳ một controller hoặc service nào ném ra lỗi hoặc gọi `next(error)`, Express sẽ tự động chuyển request tới middleware xử lý lỗi này.
- **Áp dụng thực tế vào dự án PubliCast:** Middleware xử lý lỗi toàn cục (Global Error Handler) được khai báo tại [app.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/app.js) dòng 47-53, chịu trách nhiệm ghi nhận log lỗi hệ thống và trả về phản hồi JSON tiêu chuẩn chứa mã trạng thái lỗi tương ứng (ví dụ: 500 cho Internal Server Error).

### 109. Multer dùng để làm gì?
- **Lý thuyết:** Mặc định Express không thể phân tích cú pháp dữ liệu tải lên dưới dạng file (định dạng `multipart/form-data`). `Multer` là một middleware của Express chuyên dùng để parse dữ liệu form có chứa file tải lên, cho phép trích xuất thông tin file, cấu hình nơi lưu trữ (Storage Engine) trên đĩa cứng hoặc bộ nhớ và giới hạn kích thước file.
- **Áp dụng thực tế vào dự án PubliCast:** Dùng ở admin module để cho phép tải lên hình ảnh đại diện của sản phẩm, hình ảnh sau khi tải lên được đổi tên ngẫu nhiên để tránh trùng lặp và lưu trữ vào thư mục `/uploads/products`.

### 110. Socket.IO dùng để làm gì?
- **Lý thuyết:** Socket.IO là thư viện cho phép truyền thông tin hai chiều, có độ trễ cực thấp và dựa trên sự kiện (event-driven) theo thời gian thực (realtime) giữa trình duyệt client và máy chủ backend. Nó sử dụng giao thức WebSocket làm nền tảng chính và tự động hạ cấp xuống HTTP long-polling nếu trình duyệt của client không hỗ trợ WebSocket.
- **Áp dụng thực tế vào dự án PubliCast:** Được sử dụng để gửi thông báo thay đổi trạng thái đơn hàng (ví dụ: "Đã xác nhận", "Đang giao hàng") lập tức tới màn hình theo dõi đơn hàng của người dùng mà không cần reload giao diện.

### 111. Vì sao Node.js phù hợp realtime?
- **Lý thuyết:** Nhờ kiến trúc hướng sự kiện (event-driven) kết hợp với I/O bất đồng bộ không chặn (non-blocking I/O). Node.js có khả năng duy trì hàng chục nghìn kết nối mở đồng thời (như kết nối WebSocket của Socket.IO) với chi phí sử dụng tài nguyên hệ thống (RAM/CPU) cực kỳ thấp, khác biệt hoàn toàn với các server truyền thống cấp phát một luồng vật lý cho mỗi kết nối (như Apache Tomcat).
- **Áp dụng thực tế vào dự án PubliCast:** Đáp ứng tốt nghiệp vụ thông báo đơn hàng mới realtime cho hệ thống quản trị admin mà không làm suy giảm hiệu năng chung của server.

### 112. MVC trong Express là gì?
- **Lý thuyết:** MVC (Model-View-Controller) là mô hình kiến trúc phân tách ứng dụng thành 3 thành phần:
  - **Model**: Quản lý dữ liệu và logic nghiệp vụ tương tác cơ sở dữ liệu.
  - **View**: Giao diện hiển thị thông tin cho người dùng.
  - **Controller**: Tiếp nhận request từ client, điều phối Model lấy dữ liệu và trả kết quả về View.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án áp dụng biến thể của MVC cho RESTful API: **Model** đại diện bởi các Schema Mongoose trong thư mục `models/`, **Controller** tiếp nhận request ở `controllers/` xử lý dữ liệu và trả JSON trực tiếp cho client, và **View** chính là giao diện SPA viết bằng React độc lập ở thư mục `frontend/`.

### 113. Monolith và Microservice khác nhau?
- **Lý thuyết:**
  - **Monolith (Đơn khối)**: Toàn bộ các module nghiệp vụ của ứng dụng (User, Product, Order, Payment) được đóng gói và triển khai chung trong một mã nguồn và chạy trên một server duy nhất. Dễ phát triển ban đầu nhưng khó scale độc lập từng phần.
  - **Microservices (Vi dịch vụ)**: Ứng dụng được chia nhỏ thành các dịch vụ độc lập chạy trên các server khác nhau, giao tiếp với nhau qua API (REST, gRPC) hoặc Message Broker. Dễ scale độc lập, công nghệ linh hoạt nhưng kiến trúc vô cùng phức tạp.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án hiện tại được thiết kế theo kiến trúc **Monolith** gọn gàng, toàn bộ mã nguồn API được quản lý chung trong thư mục `backend`, giúp tăng tốc độ phát triển và đơn giản hóa việc deploy trong giai đoạn đầu.

---

## PHẦN VII: API DESIGN, SECURITY & AUTHENTICATION (CÂU 114 - 130)

### 114. API là gì?
- **Lý thuyết:** API (Application Programming Interface - Giao diện lập trình ứng dụng) là một tập hợp các quy tắc, định nghĩa và giao thức cho phép các phần mềm hoặc thành phần hệ thống khác nhau có thể giao tiếp, trao đổi dữ liệu và tương tác qua lại với nhau một cách chuẩn hóa và an toàn.
- **Áp dụng thực tế vào dự án PubliCast:** API là cầu nối duy nhất giúp ứng dụng React Frontend có thể lấy danh sách sản phẩm hoặc gửi yêu cầu đăng ký tài khoản đến server Node.js.

### 115. REST API là gì?
- **Lý thuyết:** REST API là hệ thống API được thiết kế tuân thủ theo các ràng buộc và nguyên lý của kiến trúc REST. Nó sử dụng HTTP protocol làm phương tiện truyền tin chính, định vị dữ liệu thông qua các đường dẫn URI trực quan (ví dụ: `/api/users`) và sử dụng các HTTP status codes tiêu chuẩn để báo cáo kết quả thực thi.
- **Áp dụng thực tế vào dự án PubliCast:** Các route API được định nghĩa tại `backend/src/routes/` đều tuân thủ thiết kế REST API, trả về dữ liệu chuẩn JSON.

### 116. HTTP Methods gồm những gì?
- **Lý thuyết:** Các phương thức HTTP phổ biến bao gồm:
  - `GET`: Yêu cầu đọc dữ liệu của tài nguyên.
  - `POST`: Gửi dữ liệu lên server để tạo mới một tài nguyên.
  - `PUT`: Thay thế toàn bộ dữ liệu của tài nguyên bằng dữ liệu mới.
  - `PATCH`: Cập nhật một phần dữ liệu của tài nguyên.
  - `DELETE`: Xóa bỏ tài nguyên.
- **Áp dụng thực tế vào dự án PubliCast:** Sử dụng GET để lấy thông tin sản phẩm, POST để gửi thông tin đăng ký tài khoản, PATCH để cập nhật giỏ hàng tại [cart.routes.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/routes/cart.routes.js).

### 117. Khác nhau giữa PUT và PATCH?
- **Lý thuyết:**
  - `PUT`: Cập nhật theo cơ chế ghi đè toàn bộ tài nguyên. Nếu đối tượng gửi lên thiếu một số thuộc tính, các thuộc tính thiếu đó có thể bị xóa hoặc đặt về null tại Database.
  - `PATCH`: Cập nhật một phần (partial update). Server chỉ chỉnh sửa các thuộc tính được gửi kèm trong request body và giữ nguyên các thuộc tính khác của tài nguyên trong database.
- **Áp dụng thực tế vào dự án PubliCast:** Khi người dùng thay đổi số lượng của một sản phẩm trong giỏ hàng, ta sử dụng phương thức `PATCH` tại [cart.routes.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/routes/cart.routes.js) vì chỉ cần cập nhật trường `quantity` của item đó.

### 118. HTTP Status Code thường dùng?
- **Lý thuyết:** Các mã trạng thái phản hồi chuẩn từ server:
  - `200 OK`: Request thành công.
  - `201 Created`: Tạo tài nguyên mới thành công.
  - `400 Bad Request`: Lỗi dữ liệu gửi lên từ client không hợp lệ.
  - `401 Unauthorized`: Client chưa đăng nhập hoặc token không hợp lệ.
  - `403 Forbidden`: Client đã đăng nhập nhưng không có quyền truy cập.
  - `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
  - `500 Internal Server Error`: Lỗi hệ thống phát sinh tại server.
- **Áp dụng thực tế vào dự án PubliCast:** Khi đăng ký trùng email, server trả về mã `409 Conflict` hoặc nhập sai mật khẩu đăng nhập trả về mã `401 Unauthorized` tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 138.

### 119. JSON là gì?
- **Lý thuyết:** JSON (JavaScript Object Notation) là một định dạng trao đổi dữ liệu gọn nhẹ, độc lập với ngôn ngữ lập trình nhưng sử dụng cú pháp mô tả đối tượng của JavaScript. JSON được biểu diễn dưới dạng các cặp key-value và là định dạng dữ liệu tiêu chuẩn cho các API hiện đại nhờ tính chất dễ đọc đối với con người và dễ phân tích cú pháp đối với máy tính.
- **Áp dụng thực tế vào dự án PubliCast:** Toàn bộ dữ liệu trao đổi qua lại giữa frontend React và backend Node.js đều được đóng gói dưới định dạng JSON payload.

### 120. Endpoint là gì?
- **Lý thuyết:** Endpoint là một đường dẫn URL (URI) cụ thể được server API công bố công khai, là nơi tiếp nhận các yêu cầu truy cập từ client để thực hiện các thao tác xử lý dữ liệu tương ứng với tài nguyên đó.
- **Áp dụng thực tế vào dự án PubliCast:** Endpoint `/api/auth/register` (phương thức POST) dùng để tiếp nhận các yêu cầu đăng ký tài khoản mới của khách hàng tại [auth.routes.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/routes/auth.routes.js).

### 121. Request và Response khác nhau?
- **Lý thuyết:**
  - **Request (Yêu cầu)**: Là đối tượng chứa thông tin do client gửi lên server, bao gồm: Headers, Query Parameters, URL Params, và Request Body.
  - **Response (Phản hồi)**: Là đối tượng do server trả về cho client sau khi xử lý xong request, bao gồm: HTTP Status Code, Response Headers, và Response Body (thường là dữ liệu JSON).
- **Áp dụng thực tế vào dự án PubliCast:** Hai đối tượng này là các tham số đầu vào `req` và `res` của toàn bộ các hàm controller xử lý API trong thư mục `controllers/`.

### 122. Header trong API là gì?
- **Lý thuyết:** Headers là phần chứa metadata (thông tin bổ sung) đi kèm theo cả Request và Response dưới dạng các cặp key-value. Headers dùng để truyền tải các thông tin như: kiểu dữ liệu (`Content-Type`), thông tin xác thực (`Authorization`), cấu hình cache, hoặc cookie phiên làm việc.
- **Áp dụng thực tế vào dự án PubliCast:** Axios client đính kèm token xác thực vào Header `Authorization: Bearer <token>` tại [api.client.js](file:///d:/Fullit/tutorials/PubliCast/frontend/src/services/api.client.js) dòng 16 để gửi lên server kiểm tra quyền truy cập.

### 123. Flow login JWT hoạt động sao?
- **Lý thuyết:** Chi tiết luồng xác thực JWT:
  1. Người dùng điền Email/Password tại giao diện React và click Login.
  2. React gửi POST request chứa credentials lên backend.
  3. Backend kiểm tra tính chính xác của mật khẩu. Nếu đúng, sinh Access Token và Refresh Token chứa userId.
  4. Backend trả Access Token trong response body và ghi Refresh Token vào HttpOnly Cookie của trình duyệt.
  5. React nhận Access Token, lưu vào LocalStorage và cập nhật trạng thái UI.
- **Áp dụng thực tế vào dự án PubliCast:** Luồng login được lập trình chi tiết tại hàm `login()` của [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 131.

### 124. Access Token và Refresh Token khác nhau?
- **Lý thuyết:**
  - **Access Token**: Dùng để đính kèm vào mỗi request để chứng minh quyền truy cập tài nguyên. Có thời gian sống ngắn (ví dụ 15 phút) để tăng tính bảo mật.
  - **Refresh Token**: Dùng duy nhất để xin cấp lại Access Token mới khi Access Token cũ hết hạn. Có thời gian sống dài (ví dụ 7 ngày) và được lưu trữ cực kỳ bảo mật (thường trong HttpOnly Cookie và lưu hash đối chiếu ở Redis).
- **Áp dụng thực tế vào dự án PubliCast:** Thời hạn sống và cấu hình của hai loại token được định nghĩa trong [constants.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/utils/constants.js) tại dòng 46-50.

### 125. Nên lưu JWT ở đâu?
- **Lý thuyết:** 
  - Lưu **Access Token** trong bộ nhớ RAM ứng dụng (React State) hoặc LocalStorage nếu ứng dụng có cơ chế tự động refresh token tốt.
  - Lưu **Refresh Token** trong HttpOnly Cookie để bảo vệ token này khỏi sự can thiệp của JavaScript phía client, ngăn chặn tuyệt đối nguy cơ mất phiên làm việc do tấn công XSS.
- **Áp dụng thực tế vào dự án PubliCast:** Hệ thống lưu Access Token ở LocalStorage để gửi qua Header, và thiết lập Refresh Token trong Cookie bảo mật tại [auth.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/auth.service.js) dòng 72.

### 126. API versioning là gì?
- **Lý thuyết:** API Versioning là việc đánh dấu phiên bản cho hệ thống API (ví dụ: `/api/v1/...`, `/api/v2/...`). Việc này giúp đảm bảo tính tương thích ngược (backward compatibility) khi hệ thống cập nhật các logic nghiệp vụ mới hoặc thay đổi cấu trúc database mà không làm ảnh hưởng đến các phiên bản ứng dụng client cũ chưa kịp cập nhật.
- **Áp dụng thực tế vào dự án PubliCast:** Các route API được định nghĩa với tiền tố `/api/` để phân tách rõ ràng với các route hiển thị giao diện tĩnh, dễ dàng nâng cấp lên `/api/v1/` trong tương lai nếu cần thiết.

### 127. Idempotent API là gì?
- **Lý thuyết:** Idempotent (Tính gần như không đổi) là thuộc tính của một API mà khi client gọi API đó một lần hay nhiều lần liên tiếp với cùng một dữ liệu đầu vào, kết quả trạng thái của hệ thống và phản hồi trả về vẫn hoàn toàn giống hệt nhau. Các phương thức GET, PUT, DELETE, HEAD là idempotent. Phương thức POST không phải là idempotent (gọi nhiều lần tạo ra nhiều tài nguyên trùng lặp).
- **Áp dụng thực tế vào dự án PubliCast:** API xóa một sản phẩm khỏi giỏ hàng (DELETE `/api/cart/:productId`) là idempotent vì dù click xóa nhiều lần hệ thống vẫn ghi nhận sản phẩm đó đã biến mất khỏi giỏ hàng.

### 128. Stateless API là gì?
- **Lý thuyết:** Stateless (Không trạng thái) là ràng buộc thiết kế của REST API yêu cầu server không được phép lưu trữ bất kỳ thông tin nào về ngữ cảnh phiên làm việc (session state) của client trên server. Mỗi request gửi lên từ client bắt buộc phải chứa đầy đủ mọi thông tin cần thiết để server hiểu và xử lý được request đó một cách độc lập (ví dụ: chứa token xác thực trong header).
- **Áp dụng thực tế vào dự án PubliCast:** Toàn bộ API của PubliCast hoạt động theo cơ chế stateless, server xác định danh tính và quyền hạn của client thông qua việc giải mã chữ ký của JWT token đính kèm trong request tại [auth.middleware.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/middlewares/auth.middleware.js).

### 129. WebSocket khác REST API thế nào?
- **Lý thuyết:**
  - **REST API**: Hoạt động theo mô hình Request-Response (Hỏi-Đáp) một chiều. Client gửi request, server xử lý trả về response và kết nối đóng lại ngay lập tức. Client luôn là bên chủ động khơi mào kết nối.
  - **WebSocket**: Thiết lập một kết nối mở liên tục, hai chiều (full-duplex) giữa client và server thông qua một cổng duy nhất. Cả client và server đều có thể chủ động đẩy dữ liệu sang cho bên kia tại bất kỳ thời điểm nào theo thời gian thực.
- **Áp dụng thực tế vào dự án PubliCast:** REST API dùng để lấy thông tin sản phẩm và thực hiện thanh toán; WebSocket (Socket.IO) dùng để đẩy thông báo thay đổi trạng thái đơn hàng thời gian thực xuống client.

### 130. GraphQL là gì?
- **Lý thuyết:** GraphQL là một ngôn ngữ truy vấn dữ liệu dành cho API được Facebook phát triển để thay thế cho REST. Thay vì có nhiều endpoint trả về các cấu trúc dữ liệu cố định, GraphQL chỉ sử dụng duy nhất một endpoint và cho phép client chủ động định nghĩa cấu trúc dữ liệu mong muốn nhận về trong câu lệnh request. Giúp loại bỏ hiện tượng lấy thừa dữ liệu (Over-fetching) hoặc thiếu dữ liệu (Under-fetching).
- **Áp dụng thực tế vào dự án PubliCast:** Là kiến thức công nghệ nâng cao thích hợp nghiên cứu tích hợp khi hệ thống cần tối ưu hóa băng thông mạng cho các thiết bị di động truy cập danh mục sản phẩm.

---

## PHẦN VIII: FULLSTACK ARCHITECTURE & DEPLOYMENT (CÂU 131 - 136)

### 131. Các cách quản lý state trong React
- **Lý thuyết:** Hệ sinh thái React cung cấp các giải pháp quản lý state đa dạng:
  - `useState`: Cho state cục bộ, đơn giản.
  - `useReducer`: Cho state cục bộ có logic cập nhật phức tạp.
  - `Context API`: Quản lý state dùng chung cho ứng dụng quy mô vừa mà không cần cài thư viện ngoài.
  - `Redux / Redux Toolkit`: Quản lý state tập trung cho ứng dụng lớn, đòi hỏi hiệu năng cao và debug dòng dữ liệu chặt chẽ.
  - `Zustand / Recoil`: Thư viện quản lý state hiện đại, gọn nhẹ và tối ưu hóa render.
- **Áp dụng thực tế vào dự án PubliCast:** Ứng dụng React sử dụng `useState` quản lý state trong component và Context API bọc trong [CartContext.jsx](file:///d:/Fullit/tutorials/PubliCast/frontend/src/context/CartContext.jsx) để chia sẻ state giỏ hàng.

### 132. Vì sao React Query không thay Redux hoàn toàn?
- **Lý thuyết:** Bởi vì hai thư viện này giải quyết hai bài toán quản lý trạng thái hoàn toàn khác nhau trong ứng dụng React:
  - **React Query**: Chuyên biệt để quản lý **Server State** (trạng thái dữ liệu fetch từ backend, xử lý caching, đồng bộ và cập nhật lại với database phía server).
  - **Redux**: Chuyên biệt để quản lý **Client State** (các trạng thái thuần túy của giao diện người dùng như: trạng thái đóng/mở sidebar, ngôn ngữ hiển thị, giỏ hàng tạm thời, các bước của multi-step form).
- **Áp dụng thực tế vào dự án PubliCast:** Nếu hệ thống e-commerce mở rộng, ta có thể dùng React Query để quản lý cache danh sách sản phẩm từ API và dùng Redux để quản lý thông tin phiên làm việc và tùy chỉnh theme (dark/light mode) của người dùng.

### 133. Có bao nhiêu cách phổ biến lưu giỏ hàng
- **Lý thuyết:** Có ba mô hình lưu trữ giỏ hàng (Cart) phổ biến:
  1. **LocalStorage**: Dữ liệu lưu hoàn toàn tại trình duyệt của client. Ưu điểm là không tốn tài nguyên server, nhưng nhược điểm là dữ liệu sẽ bị mất nếu người dùng xóa cache trình duyệt hoặc đổi sang đăng nhập trên thiết bị khác.
  2. **Database (MongoDB/MySQL)**: Dữ liệu giỏ hàng lưu bền vững dưới database server. Đồng bộ tốt trên mọi thiết bị của user nhưng tăng tải truy vấn đọc/ghi cho database chính.
  3. **Redis Cache**: Lưu giỏ hàng tạm thời của khách hàng trong bộ nhớ RAM Redis. Đạt tốc độ truy xuất cực nhanh và đồng bộ được thiết bị, thiết lập TTL để tự động xóa giỏ hàng cũ nếu quá lâu không hoạt động.
- **Áp dụng thực tế vào dự án PubliCast:** Dự án sử dụng mô hình kết hợp: Giỏ hàng tạm thời đang được quản lý bởi Context API ở client kết hợp lưu trữ phía backend trong MongoDB thông qua [order.service.js](file:///d:/Fullit/tutorials/PubliCast/backend/src/services/order.service.js) khi tạo đơn hàng chính thức.

### 134. Khi nào nên và không nên dùng Redis cho giỏ hàng?
- **Lý thuyết:**
  - **Nên dùng**: Khi ứng dụng thương mại điện tử có lượng truy cập đồng thời khổng lồ, người dùng liên tục cập nhật, thêm bớt sản phẩm vào giỏ hàng. Sử dụng Redis giúp giảm thiểu hàng triệu truy vấn ghi trực tiếp vào MongoDB/MySQL, bảo vệ database chính khỏi bị nghẽn cổ chai.
  - **Không nên dùng**: Khi ứng dụng có quy mô nhỏ, số lượng người dùng đồng thời ít. Việc cài đặt và duy trì thêm một server Redis sẽ làm tăng chi phí vận hành và tăng độ phức tạp trong việc đồng bộ dữ liệu giữa Redis và DB chính một cách không cần thiết.
- **Áp dụng thực tế vào dự án PubliCast:** Ở quy mô ban đầu của dự án PubliCast, việc truy vấn trực tiếp thông tin giỏ hàng qua MongoDB là đủ đáp ứng và đơn giản hóa kiến trúc hệ thống.

### 135. Tổng quan các cách deploy
- **Lý thuyết:** Các giải pháp triển khai ứng dụng fullstack hiện nay:
  - **VPS (Virtual Private Server - DigitalOcean, AWS EC2)**: Tự thiết lập môi trường, cài đặt Node.js, Nginx, MongoDB, SSL. Chi phí rẻ, toàn quyền kiểm soát nhưng tốn công quản trị hệ thống.
  - **Container Orchestration (Docker Compose, Kubernetes)**: Đóng gói và chạy các dịch vụ trong container, giúp dễ dàng di chuyển mã nguồn và mở rộng quy mô.
  - **PaaS (Platform as a Service - Vercel, Render, Railway)**: Tự động hóa hoàn toàn việc build và deploy từ repository GitHub. Tiết kiệm thời gian cấu hình, phù hợp cho phát triển nhanh.
- **Áp dụng thực tế vào dự án PubliCast:** Hệ thống được thiết lập để có thể dễ dàng chạy thử nghiệm trên VPS bằng `docker-compose.yml` nhằm cấu hình tự động toàn bộ môi trường Node, DB và Cache đồng nhất.

### 136. Docker giúp gì?
- **Lý thuyết:** Docker giúp đóng gói ứng dụng cùng với toàn bộ các thư viện phụ thuộc, cấu hình môi trường và hệ điều hành tối giản vào trong một đơn vị duy nhất gọi là **Container**. Docker giải quyết triệt để vấn đề kinh điển *"code chạy tốt trên máy của tôi nhưng lỗi khi mang lên server"* bằng cách đảm bảo container sẽ chạy hoàn toàn đồng nhất trên bất kỳ máy tính hay môi trường cloud nào.
- **Áp dụng thực tế vào dự án PubliCast:** Docker giúp lập trình viên mới gia nhập dự án không cần mất hàng giờ để cài đặt thủ công MySQL, Redis hay MongoDB lên máy cá nhân, mà chỉ cần chạy lệnh `docker compose up -d` là toàn bộ hạ tầng dự án đã sẵn sàng hoạt động tại local máy ảo.

---
*Tài liệu PubliCast - Lý thuyết và Thực hành chuẩn hóa 2026.*
