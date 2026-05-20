export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ShopVN</h3>
            <p className="text-gray-400 text-sm">
              Nền tảng mua sắm trực tuyến hàng đầu Việt Nam
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-white transition">Điều khoản</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition">Hướng dẫn</a></li>
              <li><a href="#" className="hover:text-white transition">Chính sách</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@shopvn.com</li>
              <li>Hotline: 1900-xxxx</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2026 ShopVN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
