var socket = io();

var scrollToBottom = () => {

    var message = jQuery("#messages")
    var newmessage = message.children('li:last-child')

    var scrollheight = message.prop('scrollHeight')
    var clientHeight = message.prop('clientHeight')
    var scrollTop = message.prop('scrollTop')
    var newMesssageHeight = newmessage.innerHeight()
    var prevMessageHeight = newmessage.prev().innerHeight()
    if (scrollTop + clientHeight + newMesssageHeight + prevMessageHeight >= scrollheight) {
        message.scrollTop(scrollheight)
    }
};


socket.on('connect', function () {
    console.log('Connected to server');
    var prams = jQuery.deparam(window.location.search);
    socket.emit('join', prams, function (err) {
        if (err) {
            alert(err);
            window.location.href = "/"
        } else {
            // console.log('No Error')
        }

    })
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});
socket.on('updateuserlist', function (users) {
    console.log('Users List', users);
    var ol = jQuery('<ol></ol>')

    users.forEach((user) => {
        console.log(user)
        ol.append(jQuery(`<li></li>`).text(user))
    });
    jQuery("#users").html(ol)

});


socket.on('newMessage', function (message) {

    formatedDatetime = moment(message.createdat).format('h:mma')
    var template = jQuery("#message-template").html()
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,

        createdat: formatedDatetime
    });
    jQuery("#messages").append(html)
    scrollToBottom()
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();

    var messageBox = jQuery('[name=message]')

    socket.emit('createMessage', {
        text: messageBox.val()
    }, function () {
        messageBox.val("").focus()
    });
});


var locationButon = jQuery('#send-location')
locationButon.on('click', (e) => {
    e.preventDefault()
    if (!navigator.geolocation) {
        return alert("Geolocation Not supported by Browser")
    }
    locationButon.attr({"disabled": "disabled"}).text("sending Location...")
    navigator.geolocation.getCurrentPosition((position) => {

        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, function (callback) {
            console.log('call back working in location', callback)
            locationButon.removeAttr("disabled").text("Send Location")
        })
    }, () => {
        alert("Unable to fetch Location.")
    })
});

socket.on("location", (data) => {
    formatedDatetime = moment(data.createdat).format('h:mma')
    var template = jQuery("#location-template").html()
    var html = Mustache.render(template, {
        from: data.from,
        url: data.url,
        createdat: formatedDatetime,
    })
    jQuery("#messages").append(html)
    scrollToBottom()
});
socket.on("typing", (data) => {

    txt=data.text?`${data.from} is Typing`:""
    jQuery('.typing').text(txt)

});

var timeout;

function timeoutFunction() {
    typing = false;
    socket.emit("typing", {
        typing: false
    });
}

jQuery('input[name=message]').on('keypress', () => {
    socket.emit('typing', {
        typing: true
    });
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 500);
});

