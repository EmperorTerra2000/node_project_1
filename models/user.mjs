import mongoose from "mongoose";
import crypto from "node:crypto";
import validator from "validator";
import UnauthorizedError from "../errors/unauthorized-error.mjs";

// кастомная валидация email пользователя
const validateEmail = function (val) {
  return validator.isEmail(val);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: validateEmail,
    unique: true, // емайл является уникальным, повторов не должно быть
  },
  password: {
    type: String,
    required: true,
    // свойство предотвращает передачу пароля (хэш)
    // с остальными данными при запросе
    select: false,
  },
  name: {
    type: String,
    required: true,
    default: "Пользователь",
    minlength: 2,
    maxlength: 30,
  },
});

// добавим метод схеме пользователя
// у него будет два параметра - почта и пароль
// добавляем в свойство statics объекта userSchema
userSchema.statics.findUserByCredentials = function (email, password) {
  // попытаемся найти пользователя по почте
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      // не найден -> отклоняем промис
      if (!user) {
        return Promise.reject(
          new UnauthorizedError("Вы ввели неправильный логин или пароль")
        );
      }

      const hash = crypto.createHash("sha256").update(password).digest("hex");

      return new Promise((resolve, reject) => {
        if (hash != user.password) {
          reject(
            new UnauthorizedError("Вы ввели неправильный логин или пароль")
          );
        }
        resolve(user);
      });

      // найдено -> сравниваем хеши
      //   return bcrypt.compare(password, user.password).then((matched) => {
      //     if (!matched) {
      //       return Promise.reject(
      //         new UnauthorizedError("Вы ввели неправильный логин или пароль")
      //       );
      //     }

      //     return user; // возвращаем данные с пользователем
      //   });
    });
};

const User = mongoose.model("user", userSchema);

export default User;
