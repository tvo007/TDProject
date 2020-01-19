const mongoose = require('mongoose')

const Schema = mongoose.Schema

const lessonSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    creator: {type: String, required: true}
})
//todo: add booleans for lessson sections


// let DUMMY_LESSONS = [
//     {
//       id: 'l1',
//       title: 'Blue 1',
//       description: 'BLAH',
//       creator: 'TG',
//     },
//   ];

module.exports = mongoose.model('Lesson', lessonSchema)