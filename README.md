# todo-backend-typescript

This is an example implementation of [moredip's](https://github.com/moredip)
[Todo-Backend](http://todobackend.com/) API spec, using TypeScript, Node.js
and the Express framework.

This example saves TODOs in a PostgreSQL database and uses
[node-db-migrate](https://github.com/kunklejr/node-db-migrate)
for database migrations. The code can be deployed to heroku.

This code is based on the [todo-backend-express](https://github.com/dtao/todo-backend-express)
example on the [http://todobackend.com/](http://todobackend.com/) site.

## 1. Install dependencies

``` bash
> npm install
> npm install -g typescript # typescript compiler
> npm install -g tsd # typescript definition manager
```

#### Install type definitions

```bash
% tsd install
```

## 2. Set up postgres db (OSX)

#### Run postgres via docker

```bash
> docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

#### Create user and database

```
> docker exec -it some-postgres bash
\# createuser -U postgres -d -P -E db_user
\# createdb -U postgres --owner db_user --encoding utf8 tododb
```

#### Create table

```bash
> ./node_modules/db-migrate/bin/db-migrate up
[INFO] Processed migration 20160119093012-create-todos
[INFO] Processed migration 20160119093812-add-order-to-todos
[INFO] Done
```

## 3. Compile TypeScript

```bash
> tsc
```

## 4. Run the server

#### fish shell

```
> set -x DATABASE_URL postgres://db_user:db_pass@localhost/tododb
> node app/server.js
```

#### bash/zsh

```bash
% DATABASE_URL=postgres://db_user:db_pass@localhost/tododb node server.js
```

## 5. Test the server

I use [httpie](https://github.com/jkbrzt/httpie) utility to test REST API calls from the terminal. You can install it
on OSX with brew.

```bash
> brew install httpie
```

#### Test 'create todo' api

```bash
> http post :5000 title='Deploy on Heroku' order=1

HTTP/1.1 200 OK
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET,POST,PATCH,DELETE
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 88
Content-Type: application/json; charset=utf-8
Date: Tue, 26 Jan 2016 01:13:48 GMT
ETag: W/"58-6XGc4CPnaa+/LbxwvorWgw"
X-Powered-By: Express

{
    "completed": false,
    "order": 1,
    "title": "Deploy on Heroku",
    "url": "http://localhost:5000/1"
}
```

#### Test 'get all todos' api

```bash
> http :5000

HTTP/1.1 200 OK
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET,POST,PATCH,DELETE
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 90
Content-Type: application/json; charset=utf-8
Date: Tue, 26 Jan 2016 01:14:14 GMT
ETag: W/"5a-I5kxfNHhoZBy7GPZa6prYg"
X-Powered-By: Express

[
    {
        "completed": false,
        "order": 1,
        "title": "Deploy on Heroku",
        "url": "http://localhost:5000/1"
    }
]
```

## 6. Deploy to Heroku

```bash
> heroku create
> git push heroku master
> heroku addons:create heroku-postgresql:hobby-dev
> heroku run ./node_modules/db-migrate/bin/db-migrate up
> heroku ps:scale web=1
> heroku open
> heroku logs --tail
```
