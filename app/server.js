/// <reference path="../typings/express/express.d.ts"/>
/// <reference path="../typings/body-parser/body-parser.d.ts"/>
var app = require('express')(), bodyParser = require('body-parser'), backend = require('./backend');
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
var todos = backend(process.env.DATABASE_URL);
function createCallback(res, onSuccess) {
    return function callback(err, data) {
        if (err || !data) {
            res.send(500, 'Something bad happened!');
            return;
        }
        onSuccess(data);
    };
}
function createTodo(req, todo) {
    return {
        title: todo.title,
        order: todo.order,
        completed: todo.completed || false,
        url: req.protocol + '://' + req.get('host') + '/' + todo.id
    };
}
function getCreateTodo(req) {
    return function (todo) {
        return createTodo(req, todo);
    };
}
app.get('/', function (req, res) {
    todos.all(createCallback(res, function (todos) {
        res.send(todos.map(getCreateTodo(req)));
    }));
});
app.get('/:id', function (req, res) {
    todos.get(req.params.id, createCallback(res, function (todo) {
        res.send(createTodo(req, todo));
    }));
});
app.post('/', function (req, res) {
    todos.create(req.body.title, req.body.order, createCallback(res, function (todo) {
        res.send(createTodo(req, todo));
    }));
});
app.patch('/:id', function (req, res) {
    todos.update(req.params.id, req.body, createCallback(res, function (todo) {
        res.send(createTodo(req, todo));
    }));
});
app.delete('/', function (req, res) {
    todos.clear(createCallback(res, function (todos) {
        res.send(todos.map(getCreateTodo(req)));
    }));
});
app.delete('/:id', function (req, res) {
    todos.delete(req.params.id, createCallback(res, function (todo) {
        res.send(createTodo(req, todo));
    }));
});
app.listen(Number(process.env.PORT || 5000));
