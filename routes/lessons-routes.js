const express = require ('express');

const {check} = require ('express-validator');

const lessonsControllers = require ('../controllers/lessons-controllers');

const router = express.Router ();

router.get ('/:lid', lessonsControllers.getLessonById);

router.get ('/user/:uid', lessonsControllers.getLessonsByUserId);

router.post (
  '/',
  [
    check ('title').not ().isEmpty (),
    check ('description').isLength ({min: 5}),
  ],
  lessonsControllers.createLesson
);

router.patch (
  '/:lid',
  [
    check ('title').not ().isEmpty (),
    check ('description').isLength ({min: 5}),
  ],
  lessonsControllers.updateLesson
);

router.delete ('/:lid', lessonsControllers.deleteLesson);

module.exports = router;

//http://localhost:5000/api/lessons/l1

//http://localhost:5000/api/lessons/user/TG
