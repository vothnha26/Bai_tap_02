const AUTH_PROVIDERS = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE'
};

const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED'
};

const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED',
};

const PAYMENT_METHOD = {
  COD: 'COD',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
};

const ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  OTP_EXPIRED: 'OTP expired or not found',
  INVALID_OTP: 'Invalid OTP',
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email for OTP.',
  ACTIVATION_SUCCESS: 'Account activated successfully',
  // Login errors
  LOGIN_SUCCESS: 'Login successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_EMAIL: 'Email does not exist',
  INVALID_PASSWORD: 'Password is incorrect',
  ACCOUNT_NOT_ACTIVATED: 'Account not activated. Please verify your email first.',
  ACCOUNT_BANNED: 'Your account has been banned',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts. Please try again later.',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  // Profile
  USER_NOT_FOUND: 'User not found',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  ACCESS_DENIED: 'Access denied',
  // Forgot password
  FORGOT_PASSWORD_OTP_SENT: 'OTP sent if email exists',
  RESET_PASSWORD_SUCCESS: 'Password reset successfully',
  RESET_PASSWORD_OTP_EXPIRED: 'OTP has expired, please request again',
  RESET_PASSWORD_INVALID_OTP: 'Invalid OTP',
  RESET_PASSWORD_OTP_LOCKED: 'Invalid OTP too many times. Please request a new OTP.',
  NEW_PASSWORD_SAME_AS_OLD: 'New password must differ from old',
  // Order messages
  ORDER_CANCEL_SUCCESS: 'Hủy đơn hàng thành công',
  ORDER_CANCELLATION_REQUESTED: 'Đã gửi yêu cầu hủy đơn hàng cho Shop',
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_UNAUTHORIZED: 'Unauthorized access to order',
  ORDER_CANNOT_CANCEL: 'Đơn hàng đang giao hoặc đã giao, không thể hủy'
};

const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_REDIS_EXPIRY: 7 * 24 * 60 * 60 // 7 days in seconds
};

const PROMOTION_TYPES = {
  DISCOUNT: 'DISCOUNT',
  GIFT: 'GIFT',
  SHIPPING: 'SHIPPING'
};

const PROMOTION_APPLY_TO = {
  ORDER_TOTAL: 'ORDER_TOTAL',
  CHEAPEST_ITEM: 'CHEAPEST_ITEM',
  MOST_EXPENSIVE_ITEM: 'MOST_EXPENSIVE_ITEM',
  SPECIFIC_ITEMS: 'SPECIFIC_ITEMS',
  SHIPPING_FEE: 'SHIPPING_FEE'
};

const PROMOTION_DISCOUNT_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

const PROMOTION_MATCH_TYPES = {
  ANY_COMBINATION: 'ANY_COMBINATION',
  SINGLE_PRODUCT_MIN: 'SINGLE_PRODUCT_MIN'
};

const PROMOTION_USER_GROUPS = {
  ALL: 'ALL',
  NEW_USER: 'NEW_USER',
  VIP: 'VIP'
};

module.exports = {
  AUTH_PROVIDERS,
  USER_ROLES,
  USER_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ERROR_MESSAGES,
  JWT_CONFIG,
  PROMOTION_TYPES,
  PROMOTION_APPLY_TO,
  PROMOTION_DISCOUNT_TYPES,
  PROMOTION_MATCH_TYPES,
  PROMOTION_USER_GROUPS
};

