const path = require("path");
const express = require('express');
const socketIO = require("socket.io");
const http = require('http')
var port = process.env.port || 3000;
var host = process.env.host || "127.0.0.1";


var app = express();

var server = http.createServer(app)
var io = socketIO(server)

publicpath = path.join(__dirname, 'public');
console.log(publicpath)
app.use(express.static(publicpath));


io.on('connection', (socket) => {
    console.log('New user connected');
});


server.listen(port,host, () => {
    console.log(`App is running on http://${host}:${port}`)
})



