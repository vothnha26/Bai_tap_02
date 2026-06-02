import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Lazy components
const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Search = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const VerifyOTP = lazy(() => import("./pages/auth/VerifyOTP"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageOrders = lazy(() => import("./pages/admin/ManageOrders"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const Statistics = lazy(() => import("./pages/admin/Statistics"));
const ManagePromotions = lazy(() => import("./pages/admin/ManagePromotions"));
const ManageInventory = lazy(() => import("./pages/admin/ManageInventory"));
const ManageRewards = lazy(() => import("./pages/admin/rewards/ManageRewards"));

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(Login),
  },
  {
    path: "/register",
    element: withSuspense(Register),
  },
  {
    path: "/verify-otp",
    element: withSuspense(VerifyOTP),
  },
  {
    path: "/forgot-password",
    element: withSuspense(ForgotPassword),
  },
  {
    path: "/reset-password",
    element: withSuspense(ResetPassword),
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: "dashboard", element: withSuspense(AdminDashboard) },
      { path: "orders", element: withSuspense(ManageOrders) },
      { path: "statistics", element: withSuspense(Statistics) },
      { path: "categories", element: withSuspense(ManageCategories) },
      { path: "promotions", element: withSuspense(ManagePromotions) },
      { path: "inventory", element: withSuspense(ManageInventory) },
      { path: "rewards", element: withSuspense(ManageRewards) },
      { path: "add-product", element: withSuspense(AddProduct) },
      { path: "edit-product/:id", element: withSuspense(EditProduct) },
    ]
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: "cart", element: withSuspense(Cart) },
      { path: "checkout", element: withSuspense(Checkout) },
      { path: "orders", element: withSuspense(Orders) },
      { path: "order-success/:orderId", element: withSuspense(OrderSuccess) },
      { path: "product/:id", element: withSuspense(ProductDetail) },
      { path: "search", element: withSuspense(Search) },
      { path: "profile", element: withSuspense(Profile) },
      { path: "*", element: withSuspense(NotFound) },
    ],
  },
]);

