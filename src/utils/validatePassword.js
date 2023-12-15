const CustomError = require("../errors");
const {
  isLength,
  isUppercase,
  isNumber,
  isAlphanumeric,
} = require("validator");

const validatePassword = async (password) => {
  if (!isLength(password, { min: 8 })) {
    throw new CustomError.BadRequestError(
      "Password must be at least 8 characters long."
    );
  }
  if (!isUppercase(password[0])) {
    throw new CustomError.BadRequestError(
      "Password must start with a capital letter."
    );
  }

  return true;
};
module.exports = validatePassword;
