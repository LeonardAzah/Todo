const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const redis = require("redis");

const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} = require("../utils");

const client = redis.createClient();
const prisma = new PrismaClient();

const DEFAULT_EXPIRATION = 86400;

const getAllUsers = async (req, res) => {
  let { page, pageSize } = req.query;
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;
  client.get("users", (error, users) => {
    if (error) console.log(error);
    if (users != null) {
      return res.status(StatusCodes.OK).json(JSON.parse(users));
    }
  });
  const users = await prisma.user.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updateAt: true,
    },
  });
  client.setEx("users", DEFAULT_EXPIRATION, JSON.stringify(users));

  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  if (cachedUser) {
    return res.status(StatusCodes.OK).json(JSON.parse(cachedUser));
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updateAt: true,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError("User Not Found");
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  checkPermissions(req.user, user.id);
  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { email, name },
  });

  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  res.status(StatusCodes.OK).json({ message: "User deleted successfully!" });
};
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  deleteUser,
};
