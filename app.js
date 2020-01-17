const express = require ('express');
const bodyParser = require ('body-parser');
const HttpError = require ('./models/http-error');
const lessonsRoutes = require ('./routes/lessons-routes');
const usersRoutes = require ('./routes/users-routes');

const app = express ();

app.use (bodyParser.json ());

app.use ('/api/lessons', lessonsRoutes); //api/lessons

app.use ('/api/users', usersRoutes);

app.use ((req, res, next) => {
  const error = new HttpError ('Could not find this route.', 404);
  throw error;
});

app.use ((error, req, res, next) => {
  if (res.headerSent) {
    return next (error);
  }
  res.status (error.code || 500);
  res.json ({message: error.message || 'An unknown error occurred.'});
});

app.listen (5000);

//commit test 
