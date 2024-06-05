import pkg from "jsonwebtoken";
import UnauthorizedError from "../errors/unauthorized-error.mjs";

const { verify } = pkg;

// подключаем env переменные
const { NODE_ENV, JWT_SECRET } = process.env;

// Авторизация в приложении работает как мидлвэр
// Если предоставлен верный токен, запрос проходит на дальнейшую обработку
// Иначе запрос переходит контроллеру, который возвращает клиенту сообщение об ошибке
const auth = (req, res, next) => {
  // достаем токен из cookies
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.render("unauthorized");

    return next(new UnauthorizedError("Вы не авторизовались, авторизуйтесь"));
  }

  // извлечем токен
  const token = authorization?.replace("Bearer ", "");
  let payload;

  try {
    // верифицируем токен
    // метод verify вернет пейлоуд токена, если тот прошел проверку, а если нет
    // то вернет ошибку
    payload = verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );
  } catch (err) {
    res.render("unauthorized");

    return next(
      new UnauthorizedError("У вас какой-то плохой токен, авторизуйтесь !")
    );
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};

export default auth;
