const authService = require('../services/auth/auth.service');
const loginRateLimiter = require('../middlewares/login-rate-limit.middleware');
const { ERROR_MESSAGES } = require('../utils/constants');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      res.status(201).json({
        message: ERROR_MESSAGES.REGISTRATION_SUCCESS,
        userId: user.id
      });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOTP(email, otp);

      // Set HttpOnly cookies for tokens (Auto-login)
      if (result.accessToken && result.refreshToken) {
        const accessTokenMaxAge = 15 * 60 * 1000;
        const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: false, // Localhost không cần secure
          sameSite: 'lax', // Dùng lax để trình duyệt gửi cookie khi chuyển origin trong dev
          maxAge: accessTokenMaxAge,
          path: '/'
        });

        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: refreshTokenMaxAge,
          path: '/'
        });
      }

      res.status(200).json({
        message: result.message,
        user: result.user
      });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async resendOTP(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.resendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email.toLowerCase());
      res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await authService.resetPassword(email.toLowerCase(), otp, newPassword);
      res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      const body = { message: error.message };
      if (error.remainingAttempts !== undefined) {
        body.remainingAttempts = error.remainingAttempts;
      }
      res.status(status).json(body);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email.toLowerCase(), password);

      if (req.rateLimit) {
        await loginRateLimiter.resetAttempts(req.rateLimit.email, req.rateLimit.ip);
      }

      const accessTokenMaxAge = 15 * 60 * 1000;
      const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: false, // Localhost không dùng https
        sameSite: 'lax',
        maxAge: accessTokenMaxAge,
        path: '/'
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: refreshTokenMaxAge,
        path: '/'
      });

      res.status(200).json({
        message: ERROR_MESSAGES.LOGIN_SUCCESS,
        role: result.role,
        user: result.user
      });
    } catch (error) {
      const status = error.status || 500;
      if (req.rateLimit) {
        await loginRateLimiter.recordFailedAttempt(req.rateLimit.email, req.rateLimit.ip);
      }
      res.status(status).json({ message: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const jwtUtils = require('../utils/jwt.utils');
      let userId;
      try {
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        userId = decoded.id;
      } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const result = await authService.refreshTokens(refreshToken, userId);

      const accessTokenMaxAge = 15 * 60 * 1000;
      const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: accessTokenMaxAge,
        path: '/'
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: refreshTokenMaxAge,
        path: '/'
      });

      res.status(200).json({ 
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await authService.logout(userId);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
