import express from "express";
import { Joi, celebrate, Segments } from "celebrate";
//import multer from "multer";
import { login, renderPage } from "../controllers/signin.mjs";

const router = express.Router(); // создали роутер

//const upload = multer({ dest: "uploads/" }); // Указываем папку для временного хранения файлов

// Middleware для обработки multipart/form-data и валидации данных
// const validateUpload = celebrate({
//   [Segments.BODY]: Joi.object().keys({
//     // Добавьте здесь ваши валидации для текстовых полей формы
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//   }),
// });

// router.post("/signin", upload.single("file"), validateUpload, login);

router.post(
  "/signin",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login
);

router.get("/signin", renderPage);

export default router;
