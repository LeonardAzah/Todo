const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  validatePassword,
  hashPassword,
  comparePassword,
} = require("../utils");
const crypto = require("crypto");

const prisma = new PrismaClient();
const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  await validatePassword(password);
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res.status(StatusCodes.CREATED).json({
    msg: "User account created",
  });
};

const registerAdmin = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  await validatePassword(password);
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  res.status(StatusCodes.CREATED).json({
    msg: "Account created successfully!",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await comparePassword(password, user.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);

  //create refresh token
  let refreshToken = "";

  // check for existing tokens
  const existingToken = await prisma.token.findUnique({
    where: { userId: user.id },
  });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, userId: user.id };
  await prisma.token.create({
    data: {
      refreshToken: userToken.refreshToken,
      ip: userToken.ip,
      userAgent: userToken.userAgent,
      userId: userToken.userId,
    },
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await prisma.token.delete({ where: { userId: req.user.userId } });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

module.exports = {
  register,
  login,
  logout,
  registerAdmin,
};
