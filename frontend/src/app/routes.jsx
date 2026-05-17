import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCategories from "./pages/ManageCategories";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

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
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/admin/categories",
    Component: ManageCategories,
  },
  {
    path: "/admin/add-product",
    Component: AddProduct,
  },
  {
    path: "/admin/edit-product/:id",
    Component: EditProduct,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "search", Component: Search },
      { path: "*", Component: NotFound },
    ],
  },
]);
