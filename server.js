const path = require("path");
const express = require('express');

var port = process.env.port || 3000;
var host = process.env.host || "127.0.0.1";


var app = express();

publicpath = path.join(__dirname, '../public');
app.use(express.static(publicpath));


app.listen(port,host, () => {
    console.log(`App is running on http://${host}:${port}`)
})



