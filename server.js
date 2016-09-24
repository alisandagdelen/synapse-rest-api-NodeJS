var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO App !! Root');
});
// GET /todos?
app.get('/todos', middleware.requireAuthentication, function(req, res) {
		var query = req.query;
		var where = {
			userId: req.user.get('id')
		};

		
		if (query.hasOwnProperty('q') && query.q.length > 0) {
			where.description = {
				$like: '%' + query.q + '%'
			};
		}
		db.todo.findAll({
			where: where
		}).then(function(todos) {
			res.json(todos);
		}, function(e) {
			res.status(500).send();
		});
		
	})
// GET /travels?
app.get('/travels', middleware.requireAuthentication, function(req, res) {
		var query = req.query;
		var where = {
			userId: req.user.get('id')
		};

		
		if (query.hasOwnProperty('q') && query.q.length > 0) {
			where.description = {
				$like: '%' + query.q + '%'
			};
		}
		db.travel.findAll({
			where: where
		}).then(function(travels) {
			res.json(travels);
		}, function(e) {
			res.status(500).send();
		});
		
	})

	// GET /todos/:d 
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});

});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'title', 'description','date');
	db.todo.create(body).then(function(todo) {

		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	});
	
});
// POST /travel
app.post('/travel', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'title', 'description','date','from','to');
	db.travel.create(body).then(function(travel) {

		req.user.addTravel(travel).then(function() {
			return travel.reload();
		}).then(function(travel) {
			res.json(travel.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	});
	
});
// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with that id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});

});
//
// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	/*
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	*/
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());

			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	})
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password' ,'username');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});
// POST /user/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).send();
	});

});

// DELETE /user/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port !' + PORT + '!');
	});
});