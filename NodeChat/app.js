var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var low = require('lowdb');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//module.exports = app;

var port = 1337;
//app.set('port', process.env.PORT || 3000);
var server = app.listen(port);
//var serve = app.listen();

module.exports = server;

var io = require('socket.io')(server);

server.listen(port, function () {
    console.log('Express server listening on port ' + port);
});

// database
const db = low();
db.defaults({ messages: [] }).write(); // create empty array of messages
const uuid = require('uuid');


//const postId = db.get('posts').push({ id: uuid(), title: 'low!' }).write().id
//const post = db.get('posts').find({ id: postId }).value()


io.on('connection', function (socket) {
    console.log('a user connected');
    var collection = db.get('messages').takeRight(10).value();
    console.log(collection);
    console.log('db state:');
    console.log(db.getState());
    //var stream = collection.stream();
    //stream.on('data', function (chat) { socket.emit('chat', chat.msg); });
    collection.forEach(chat => {
        console.log("sending old message... " + chat.msg);
        socket.emit('chat', chat.msg);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('chat', function (msg) {
        socket.broadcast.emit('chat', msg);

        console.log('pushing message: ' + msg);
        //db.get('messages').push({ msg: msg, id: uuid() }).write();
        db.get('messages').push({ msg: msg }).write();
        console.log(db.getState());
    });
});

