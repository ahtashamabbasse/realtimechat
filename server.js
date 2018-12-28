const path = require("path");
const express = require('express');
const socketIO = require("socket.io");
const http = require('http')
const {generateMessage,generateLocation} = require('./utility/message')
const {isRealString} = require('./utility/validation')
const {User} = require('./utility/users')

var port = process.env.PORT || 3000;
var host = process.env.HOST || "127.0.0.1";


var app = express();
var users=new User();
var server = http.createServer(app)
var io = socketIO(server)

publicpath = path.join(__dirname, '/public');
app.use(express.static(publicpath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join',(params,callback)=>{
        if (!isRealString(params.name) || !isRealString(params.room) ){
            return callback("Username and Room name is required")
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room);

        // console.log(users.getUserList(params.room));

        io.to(params.room).emit('updateuserlist',users.getUserList(params.room))
        socket.emit('newMessage', generateMessage(`${params.name}`, 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage(`${params.name}`, `${params.name} has Joined`));
        callback()
    });



    socket.on('createMessage', (message, callback) => {
        var user=users.getUser(socket.id)
        if (user && isRealString(message.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
            callback('This is from the server.');
        }


    });


    socket.on('createLocationMessage', (location,callback) => {
        var user=users.getUser(socket.id);
        console.log(user);
        io.to(user.room).emit('location', generateLocation(user.name,location.latitude,location.longitude))
        callback('success')
    });

    socket.on('typing', (typing) => {
        console.log(typing)
        var user=users.getUser(socket.id)
        console.log(user)
        if (typing) {
            socket.broadcast.to(user.room).emit('typing', generateMessage(user.name,typing.typing))
        }
    });




    socket.on('disconnect', () => {
        var user=users.removeUser(socket.id)
        if (user)
        {
            io.to(user.room).emit('updateuserlist',users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage(`${user.name}`,`${user.name} Left the chat`))
        }

    });
});


server.listen(port,host, () => {
    console.log('App is running on ' + port + " Port")
})



