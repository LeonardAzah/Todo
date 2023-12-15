const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createTask = async (req, res) => {
  const { title } = req.body;
  const todo = await prisma.task.create({
    data: {
      title,
      userId: req.user.userId,
    },
  });
  res.status(StatusCodes.CREATED).json({ todo });
};
const getTasks = async (req, res) => {
  let { page, pageSize } = req.query;
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;

  const todos = await prisma.task.findMany({
    where: { userId: req.user.userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.status(StatusCodes.OK).json({ todos });
};
const getSingleTask = async (req, res) => {
  const todo = await prisma.task.findUnique({
    where: {
      id: req.params.id,
    },
  });
  res.status(StatusCodes.OK).json({ todo });
};
const updateTask = async (req, res) => {
  const todo = await prisma.task.update({
    where: {
      id: req.params.id,
    },
    data: {
      completed: true,
    },
  });

  res.status(StatusCodes.OK).json({ todo });
};
const deleteTask = async (req, res) => {
  await prisma.task.delete({
    where: {
      id: req.params.id,
    },
  });
  res.status(StatusCodes.OK).json({ message: "Task deleted successfuly!" });
};

module.exports = {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  deleteTask,
};
