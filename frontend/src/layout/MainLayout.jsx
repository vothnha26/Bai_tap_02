import { Outlet } from 'react-router';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
