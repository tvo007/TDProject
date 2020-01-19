const uuid = require ('uuid/v4');
const {validationResult} = require ('express-validator');
const mongoose = require ('mongoose');
const HttpError = require ('../models/http-error');
const Lesson = require ('../models/lesson');
const User = require ('../models/user');


const getLessonById = async (req, res, next) => {
  const lessonId = req.params.lid; //{pid: 'p1'}
  let lesson;

  try {
    lesson = await Lesson.findById (lessonId);
  } catch (err) {
    const error = new HttpError (
      'Something went wrong. Could not find lesson.',
      500
    );
    return next (error);
  }

  if (!lesson) {
    // const error = new Error ('Could not find a lesson for the provided id.');
    // error.code = 404;
    // throw error;
    const error = new HttpError (
      'Could not find lesson for the provided id.',
      404
    );
    return next (error);
  }

  res.json ({lesson: lesson.toObject ({getters: true})}); //getters???
};

//function getLessonById() {...}
//const getLessonById = function() {...}

const getLessonsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let lessons;
  try {
    lessons = await Lesson.find ({creator: userId});
  } catch (err) {
    const error = new HttpError (
      'Fetching lessons failed, please try again later',
      500
    );
    return next (error);
  }

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

  res.json ({
    lessons: lessons.map (lesson => lesson.toObject ({getters: true})),
  });
};

//cannot use .find with array, use map instead to get ride of _

const createLesson = async (req, res, next) => {
  const errors = validationResult (req);
  if (!errors.isEmpty ()) {
    console.log (errors);
    throw new HttpError ('Invalid inputs passed. Please check your data.', 422);
  }
  const {title, description, creator} = req.body;
  //const title = req.body.title
  const createdLesson = new Lesson ({
    title,
    description,
    creator,
  });

  let user;

  try {
    user = await User.findById (creator);
  } catch (err) {
    const error = new HttpError (
      'Creating lesson failed. Please try again.',
      500
    );
    return next (error);
  }

  if (!user) {
    const error = new HttpError ('Could not find user for provided id.', 404);
    return next (error);
  }

  console.log (user);

  try {
    const sess = await mongoose.startSession ();
    sess.startTransaction ();
    await createdLesson.save ({session: sess});
    user.lessons.push (createdLesson);
    await user.save ({session: sess});
    sess.commitTransaction ();
    /**
     * starts session, allows two async actions to happen:  
     * confirm new lesson,
     * update user with new lesson
     * ^^ these two must be true and commited or else error is thrown
     * session-transaction system allows revertion of data upon error
     *  */
  } catch (err) {
    const error = new HttpError (
      'Creating lesson failed, please try again.',
      500
    );
    return next (error);
  }

  res.status (201).json ({lesson: createdLesson});
};

const updateLesson = async (req, res, next) => {
  const errors = validationResult (req);
  if (!errors.isEmpty ()) {
    return next (
      new HttpError ('Invalid inputs passed. Please check your data.', 422)
    );
  }

  const {title, description} = req.body;
  const lessonId = req.params.lid;

  let lesson;

  try {
    lesson = await Lesson.findById (lessonId);
  } catch (err) {
    const error = new HttpError (
      'Something went wrong, could not find lesson.',
      500
    );
    return next (error);
  }

  // const updatedLesson = {...DUMMY_LESSONS.find (l => l.id === lessonId)};
  // const lessonIndex = DUMMY_LESSONS.findIndex (l => l.id === lessonId);
  lesson.title = title;
  lesson.description = description;

  try {
    await lesson.save ();
  } catch (err) {
    const error = new HttpError (
      'Something went wrong, could not update lesson'
    );
    return next (error);
  }

  // DUMMY_LESSONS[lessonIndex] = updatedLesson;

  res.status (200).json ({lesson: lesson.toObject ({getters: true})});
};

const deleteLesson = async (req, res, next) => {
  const lessonId = req.params.lid;

  let lesson;
  try {
    lesson = await Lesson.findById (lessonId).populate ('creator');
  } catch (err) {
    const error = new HttpError (
      'Something went wrong. Could not delete lesson.',
      500
    );
    return next (error);
  }

  if (!lesson) {
    const error = new HttpError ('Could not find lesson for this id', 404);
    return next (error);
  }

  try {
    const sess = await mongoose.startSession ();
    sess.startTransaction ();
    await lesson.remove ({session: sess});
    lesson.creator.lessons.pull (lesson);
    await lesson.creator.save ({session: sess});
    await sess.commitTransaction ();
  } catch (err) {
    const error = new HttpError (
      'Something went wrong. Could not delete lesson.',
      500
    );
    return next (error);
  }

  res.status (200).json ({message: 'Deleted lesson.'});
};

exports.getLessonById = getLessonById;

exports.getLessonsByUserId = getLessonsByUserId;

exports.createLesson = createLesson;

exports.updateLesson = updateLesson;

exports.deleteLesson = deleteLesson;
