import express from "express";
import { Joi, celebrate, Segments } from "celebrate";
import { createUser, renderPage } from "../controllers/signup.mjs";

const router = express.Router(); // создали роутер

// const { createUser } = require("../controllers/signup.mjs"); // импортируем контроллеры для пользователей

router.post(
  "/signup",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser
);

router.get("/signup", renderPage);

export default router;
