const CustomError = require("../errors");

const checkPermissions = (requestUser, resourseUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourseUserId.toString()) return;
  throw new CustomError.UnauthorizedError("Unauthorized to access resource");
};

module.exports = checkPermissions;
