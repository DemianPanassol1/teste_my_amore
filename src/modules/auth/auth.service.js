const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../../utils/AppError");
const usersRepository = require("../users/users.repository");

function createToken(user) {
  return jwt.sign({}, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn,
  });
}

function authResponse(user) {
  return {
    user,
    token: createToken(user),
  };
}

async function register({ name, email, password }) {
  const existingUser = usersRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError("Email ja cadastrado.", 409, "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = usersRepository.create({ name, email, passwordHash });

  return authResponse(user);
}

async function login({ email, password }) {
  const userWithPassword = usersRepository.findByEmail(email);

  if (!userWithPassword) {
    throw new AppError("Email ou senha invalidos.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Email ou senha invalidos.", 401, "INVALID_CREDENTIALS");
  }

  const { passwordHash: _passwordHash, ...user } = userWithPassword;
  return authResponse(user);
}

function me(user) {
  return user;
}

module.exports = {
  register,
  login,
  me,
};
