const {validationResult} = require ('express-validator');
const HttpError = require ('../models/http-error');
const User = require ('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find ({}, '-password');
  } catch (err) {
    const error = new HttpError (
      'Fetching users failed. Please again later.',
      500
    );
    return next (error);
  }
  res.json ({users: users.map (user => user.toObject ({getters: true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult (req);
  if (!errors.isEmpty ()) {
    console.log (errors);
    return next (
      new HttpError ('Invalid inputs passed. Please check your data.', 422)
    );
  }
  const {name, email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne ({email: email});
  } catch (err) {
    const error = new HttpError (
      'Sign up failed. Please try again later.',
      500
    );
    return next (error);
  }

  if (existingUser) {
    const error = new HttpError (
      'User exists already. Please login instead.',
      422
    );
    return next (error);
  }

  const createdUser = new User ({
    name,
    email,
    image: 'https://res.cloudinary.com/ddj5orpun/image/upload/v1569892177/image2_nsafka.jpg',
    password,
    lessons: [],
  });

  try {
    await createdUser.save ();
  } catch (err) {
    const error = new HttpError ('Signing up failed. Please try again.', 500);
    return next (error);
  }

  res.status (201).json ({user: createdUser.toObject ({getters: true})});
};

const login = async (req, res, next) => {
  const {email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne ({email: email});
  } catch (err) {
    const error = new HttpError ('Login failed. Please try again.', 500);
    return next (error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError (
      'Invalid credentials, could not log you in.',
      401
    );
    return next (error);
  }

  res.json ({
    message: 'Logged in!',
    user: existingUser.toObject ({getters: true}),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
