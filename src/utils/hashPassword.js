const bcrypt = require("bcryptjs");
const CustomError = require("../errors");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    // throw new CustomError.BadRequestError("Password hashed failed");
    console.log(error);
  }
};

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    // throw new CustomError.BadRequestError("Invalid credentials")
    console.log(error);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
