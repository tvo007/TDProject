const uuid = require ('uuid/v4');
const {validationResult} = require ('express-validator');
const HttpError = require ('../models/http-error');

let DUMMY_LESSONS = [
  {
    id: 'l1',
    title: 'Blue 1',
    description: 'BLAH',
    creator: 'TG',
  },
];

const getLessonById = (req, res, next) => {
  const lessonId = req.params.lid; //{pid: 'p1'}
  const lesson = DUMMY_LESSONS.find (l => {
    return l.id === lessonId;
  });

  if (!lesson) {
    // const error = new Error ('Could not find a lesson for the provided id.');
    // error.code = 404;
    // throw error;

    throw new HttpError ('Could not find lesson for the provided id.');
  }

  res.json ({lesson}); // {lesson: lesson}
};

//function getLessonById() {...}
//const getLessonById = function() {...}

const getLessonsByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const lessons = DUMMY_LESSONS.filter (l => {
    return l.creator === userId;
  });

  if (!lessons || lessons.length === 0) {
    // const error = new Error (
    //   'Could not find a lesson for the provided user id.'
    // );
    // error.code = 404;
    // return next (error);

    return next (
      new HttpError ('Could not find lessons for the provided user id.', 404)
    );
  }

  res.json ({lessons});
};

const createLesson = (req, res, next) => {
  const errors = validationResult (req);
  if (!errors.isEmpty ()) {
    console.log (errors);
    throw new HttpError ('Invalid inputs passed. Please check your data.', 422);
  }
  const {title, description, creator} = req.body;
  //const title = req.body.title
  const createdLesson = {
    id: uuid (),
    title,
    description,
    creator,
  };

  DUMMY_LESSONS.push (createdLesson);

  res.status (201).json ({lesson: createdLesson});
};

const updateLesson = (req, res, next) => {
  const errors = validationResult (req);
  if (!errors.isEmpty ()) {
    console.log (errors);
    throw new HttpError ('Invalid inputs passed. Please check your data.', 422);
  }

  const {title, description} = req.body;
  const lessonId = req.params.lid;

  const updatedLesson = {...DUMMY_LESSONS.find (l => l.id === lessonId)};
  const lessonIndex = DUMMY_LESSONS.findIndex (l => l.id === lessonId);
  updatedLesson.title = title;
  updatedLesson.description = description;

  DUMMY_LESSONS[lessonIndex] = updatedLesson;

  res.status (200).json ({lesson: updatedLesson});
};

const deleteLesson = (req, res, next) => {
  const lessonId = req.params.lid;
  if (DUMMY_LESSONS.find (l => l.id === lessonId)) {
    throw new HttpError ('Could not find a lesson with that id', 404);
  }
  DUMMY_LESSONS = DUMMY_LESSONS.filter (l => l.id !== lessonId);
  res.status (200).json ({message: 'Deleted lesson.'});
};

exports.getLessonById = getLessonById;

exports.getLessonsByUserId = getLessonsByUserId;

exports.createLesson = createLesson;

exports.updateLesson = updateLesson;

exports.deleteLesson = deleteLesson;
