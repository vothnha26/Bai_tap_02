import { createBrowserRouter } from "react-router";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageCategories from "./pages/admin/ManageCategories";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Statistics from "./pages/admin/Statistics";
import ManagePromotions from "./pages/admin/ManagePromotions";
import ManageInventory from "./pages/admin/ManageInventory";
import ManageRewards from "./pages/admin/rewards/ManageRewards";
import AdminLayout from "./layout/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/verify-otp",
    Component: VerifyOTP,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "dashboard", Component: AdminDashboard },
      { path: "orders", Component: ManageOrders },
      { path: "statistics", Component: Statistics },
      { path: "categories", Component: ManageCategories },
      { path: "promotions", Component: ManagePromotions },
      { path: "inventory", Component: ManageInventory },
      { path: "rewards", Component: ManageRewards },
      { path: "add-product", Component: AddProduct },
      { path: "edit-product/:id", Component: EditProduct },
    ]
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "orders", Component: Orders },
      { path: "order-success/:orderId", Component: OrderSuccess },
      { path: "product/:id", Component: ProductDetail },
      { path: "search", Component: Search },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);
