const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

// Object untuk menyimpan data login attempts
const loginAttempts = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check apakah user telah melebihi limit attempts
    if (loginAttempts[email] && loginAttempts[email].count >= 5) {
      const currentTime = new Date();
      const lastAttemptTime = loginAttempts[email].lastAttempt;
      const timeDiff = (currentTime - lastAttemptTime) / (1000 * 60); // Dalam menit

      // Jika lebih dari 30 menit, reset counter
      if (timeDiff >= 30) {
        loginAttempts[email] = { count: 0, lastAttempt: null };
      } else {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts',
          {
            timestamp: new Date().toISOString(),
            attemptCount: loginAttempts[email].count
          }
        );
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Tambahkan atau update data login attempts
      if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 1, lastAttempt: new Date() };
      } else {
        loginAttempts[email].count++;
        loginAttempts[email].lastAttempt = new Date();
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password',
        {
          timestamp: new Date().toISOString(),
          attemptCount: loginAttempts[email].count
        }
      );
    }

    // Reset counter jika login berhasil
    loginAttempts[email] = { count: 0, lastAttempt: null };

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
