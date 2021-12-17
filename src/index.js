//index.js - server side
const path = require('path')
const http = require('http')
const Filter = require('bad-words')

const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://yashgarg1:newpassword@cluster0.h8tin.mongodb.net/message-database?retryWrites=true&w=majority'  //fetched from mongodb atlas
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Mongo connected');
}).catch((e) => {
    console.log(e);
})

const msgModel = require('./models/messages')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const express = require('express')
const socketio = require('socket.io')

const app = express()   //app generated
const server = http.createServer(app)   //done by express itself

const io = socketio(server) //configures socket.io with the server

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// app.use(express.static('public'))
app.use(express.static(publicDirectoryPath))

//runs when client connects
io.on('connection', (socket) => {   //socket: object whose methods will be used
    console.log('New webSocket Connection');

    //emit(): to send an event to the client side
    //after event name, any no of arguments can be passed to client side

    //boradcast: to everyone except current socket/user
    //on(): Recieving event from client side

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })
        // socket.on('join', (options, callback) => {
        //     const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            console.log('callback called');
            return callback(error)
        }

        socket.join(user.room)

        // socket.to(user.room).emit('message', generateMessage('Admin', 'Welcome to the family'))
        // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))

        //emiting user and room to show on sidebar
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // SHOW HISTORY
        msgModel.find().then((result) => {
            // console.log('History show step1');
            socket.emit('chat-history', { result, room: user.room })
        }).catch((e) => {
            console.log('History step1 error:', e);
        })

        callback()
    })

    //SEND MESSAGE
    socket.on('sendMessage', (msg, callback) => {

        const user = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(msg)) {
            // return callback('Profanity not allowed!')
            msg = filter.clean(msg) //shit -> ****
        }

        //making object to save in database
        const currMessage = new msgModel({ msg: msg, username: user.username, createdAt: new Date().getTime(), room: user.room })

        currMessage.save().then(() => { //saving to the database

            //io.emit(): send to everyone
            io.to(user.room).emit('message', generateMessage(user.username, msg))
            callback()
        })
    })

    socket.on('sendLocation', (locationObject, callback) => {
        const user = getUser(socket.id)
        const urlString = `https://google.com/maps?q=${locationObject.latitude},${locationObject.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, urlString))
        callback()  //this will call acknowledgement and re-enable button
    })

    //runs when client disconnects
    socket.on('disconnect', () => {
        const userRemoved = removeUser(socket.id)

        if (userRemoved) {
            io.to(userRemoved.room).emit('message', generateMessage('Admin', `${userRemoved.username} has left`))

            io.to(userRemoved.room).emit('roomData', {
                room: userRemoved.room,
                users: getUsersInRoom(userRemoved.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on port', port);
})