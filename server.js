const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/formatMessage')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')
const app = express()

const server = http.createServer(app)
const io = socketio(server)

const botName = 'ChatBot'

//Run when a client connects.
io.on('connection', socket => {

    socket.on('joinRoom', ({username,room})=> {
        const user = userJoin(socket.id, username,room)
        socket.join(user.room)
        

         //emit to client side.(Emitting to a single client which is connecting.)
        socket.emit('message',formatMessage(botName,'Welcome to Chatcord'))

        //Broadcast when a user connects. (Broadcast to all of the client except the one which is connecting.)
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined a chat`))


        // //Broadcasting all the users in a room.
        // let roomUsers = getRoomUsers(user.room)
        // roomUsers = roomUsers.map(user=> user.username)
        // console.log(roomUsers);
        // io.to(user.room).emit('roomUsers',roomUsers)
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
        
        //Broadcast to all of the clients.
        // io.emit()
    })
    // console.log('New WebSocket connection...');

  //Listen for chat message.
     socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
         //emitting the catched message to everyone.
         io.to(user.room).emit('message',formatMessage(user.username, msg))
     })
    //Runs when a client disconnects.
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat.`))
        }
      //Broadcasting all the users in a room.
    //   let roomUsers = getRoomUsers(user.room)
    //   roomUsers = roomUsers.map(user=> user.username)
    // //   console.log(roomUsers);
    //   io.to(user.room).emit('roomUsers',roomUsers)
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    })
      

        
    }) 
})

//set static folder
app.use(express.static(path.join(__dirname,'public')))
const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server started on port ${PORT}`))