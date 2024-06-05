// загружает файл .env в Node.js
import { config } from "dotenv";

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "node:path";
import cookieParser from "cookie-parser";
// import { renderFile } from "ejs";
import { errors } from "celebrate";
import NotFoundError from "../errors/not-found-error.mjs";
import cors from "../middlewares/cors.mjs";
import auth from "../middlewares/auth.mjs";

import { routerSignIn, routerSignUp } from "../routes/index.mjs";

config();

// подключаем environment переменные
const { NODE_ENV, JWT_SECRET, DB_ROUTE } = process.env;

const { PORT = 3000 } = process.env;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приема страниц внутри POST-запроса
// Когда вы устанавливаете 'view engine' в 'ejs', Express.js знает,
// что вы хотите использовать EJS для рендеринга ваших шаблонов.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
// промежуточный обработка сookie-parser
// исполь-ся для шифрования значений файлов перед их отправкой клиенту
app.use(cookieParser(NODE_ENV === "production" ? JWT_SECRET : "dev-secret"));

// подключаемся к серверу mongo
mongoose.connect(
  NODE_ENV === "production" ? DB_ROUTE : "mongodb://127.0.0.1:27017/authData",
  {
    useNewUrlParser: true,
  }
);

app.use(cors); // обработка кросс-доменных запросов

app.use(routerSignIn);
app.use(routerSignUp);

// app.get("/", (req, res) => {
//   // Render page using renderFile method
//   renderFile(
//     path.join(__dirname, "./index.ejs"),
//     {},
//     {},
//     function (err, template) {
//       if (err) {
//         throw err;
//       } else {
//         res.end(template);
//       }
//     }
//   );

//   // res.send("The sedulous hyena ate the antelope!");
// });

// мидлвэр авторизации используем для всего приложения
app.use(auth);

app.get("/", (req, res) => {
  res.render("index");
});

// обработка запроса на несуществующий роут
app.use((req, res, next) => {
  next(new NotFoundError("404 Страница по указанному маршруту не найдена."));
});

// обработчки ошибок celebrate
app.use(errors());

// централизованная обработка ошибок
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  console.log(message);
  console.log(statusCode);
  res.status(statusCode).send({
    message: statusCode === 500 ? "500 На сервере произошла ошибка." : message,
  });

  next();
});

app.listen(PORT, () => {
  console.log(`App listening ob port ${PORT}`);
});
