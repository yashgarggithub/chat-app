const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    msg: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    createdAt: {
        type: Number,
        require: true
    },
    room: {
        type: String,
        requir: true
    }
})

//msgs -> msg (model name)
const Msg = mongoose.model('msg', msgSchema)

module.exports = Msg