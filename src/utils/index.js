const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
const validatePassword = require("./validatePassword");
const { hashPassword, comparePassword } = require("./hashPassword");
const paginate = require("./paginate");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  validatePassword,
  hashPassword,
  comparePassword,
  paginate,
};
