/// <reference path="./typings/pg/pg.d.ts"/>

var pg = require('pg.js');
import Models = require('./models');
import {QueryResult, Client} from "pg";
import {Todo} from "./models";

type TodosCB = (err: Error, rows: Todo[]) => any;
type TodoCB = (err: Error, rows: Todo) => any;

module.exports = function createTodoBackend(connectionString: string) {
  function query(query: string, params: any[], callback: TodosCB) {
    pg.connect(connectionString, function(err: Error, client: Client, done: () => void) {
      done();

      if (err) {
        console.error(err);
        callback(err, null);
        return;
      }

      client.query(query, params, function(err: Error, result: QueryResult) {
        if (err) {
          console.error(err);
          callback(err, null);
          return;
        }

        callback(null, result.rows);
      });
    });
  }

  return {
    all: function(callback: TodosCB) {
      query('SELECT * FROM todos', [], (err: Error, todos: Todo[]) => callback(err, todos));
    },

    get: function(id: number, callback: TodoCB) {
      query('SELECT * FROM todos WHERE id = $1', [id], (err: Error, todos: Todo[]) => callback(err, todos && todos[0]));
    },

    create: function(title: string, order: string, callback: TodoCB) {
      query('INSERT INTO todos ("title", "order", "completed") VALUES ($1, $2, false) RETURNING *', [title, order],
        (err: Error, todos: Todo[]) => callback(err, todos && todos[0]));
    },

    update: function(id: number, properties: Models.Todo, callback: TodoCB) {
      var assigns: string[] = [];
      var values: any[] = [];
      if ('title' in properties) {
        assigns.push('"title"=$' + (assigns.length + 1));
        values.push(properties.title);
      }
      if ('order' in properties) {
        assigns.push('"order"=$' + (assigns.length + 1));
        values.push(properties.order);
      }
      if ('completed' in properties) {
        assigns.push('"completed"=$' + (assigns.length + 1));
        values.push(properties.completed);
      }

      var updateQuery = [
        'UPDATE todos',
        'SET ' + assigns.join(', '),
        'WHERE id = $' + (assigns.length + 1),
        'RETURNING *'
      ];

      query(updateQuery.join(' '), values.concat([id]), function (err: Error, rows: Todo[]) {
        callback(err, rows && rows[0]);
      });
    },

    delete: function(id: number, callback: TodoCB) {
      query('DELETE FROM todos WHERE id = $1 RETURNING *', [id], function(err: Error, rows: Todo[]) {
        callback(err, rows && rows[0]);
      });
    },

    clear: function(callback: TodosCB) {
      query('DELETE FROM todos RETURNING *', [], callback);
    }
  };
};
