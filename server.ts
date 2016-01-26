/// <reference path="./typings/express/express.d.ts"/>
/// <reference path="./typings/body-parser/body-parser.d.ts"/>

import {Request, Response, Application} from "express";
import {Todo} from "./models";

interface TodoREST {
  title: string;
  order: number;
  completed: boolean;
  url: string;
}

var app: Application = require('express')(),
    bodyParser = require('body-parser'),
    backend = require('./backend');

// ----- Parse JSON requests

app.use(bodyParser.json());

// ----- Allow CORS

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ----- The API implementation

var todos = backend(process.env.DATABASE_URL);

function createCallback(res: Response, onSuccess: (data: any) => void) {
  return function callback(err: Error, data: any) {
    if (err || !data) {
      res.send(500, 'Something bad happened!');
      return;
    }

    onSuccess(data);
  }
}

function createTodo(req: Request, todo: Todo): TodoREST {
  return {
    title: todo.title,
    order: todo.order,
    completed: todo.completed || false,
    url: req.protocol + '://' + req.get('host') + '/' + todo.id
  };
}

function getCreateTodo(req: Request) {
  return function(todo: Todo) {
    return createTodo(req, todo);
  };
}

app.get('/', function(req, res) {
  todos.all(createCallback(res, function(todos) {
    res.send(todos.map(getCreateTodo(req)));
  }));
});

app.get('/:id', function(req, res) {
  todos.get(req.params.id, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.post('/', function(req, res) {
  todos.create(req.body.title, req.body.order, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.patch('/:id', function(req, res) {
  todos.update(req.params.id, req.body, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.delete('/', function(req, res) {
  todos.clear(createCallback(res, function(todos) {
    res.send(todos.map(getCreateTodo(req)));
  }));
});

app.delete('/:id', function(req, res) {
  todos.delete(req.params.id, createCallback(res, function(todo: Todo) {
    res.send(createTodo(req, todo));
  }));
});

app.listen(Number(process.env.PORT || 5000));
