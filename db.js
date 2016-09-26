var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}
/*
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api.sqlite'
});ww
*/
var db = {};
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.travel = sequelize.import(__dirname + '/models/travel.js');
db.shopping = sequelize.import(__dirname + '/models/shopping.js');
db.anniversary = sequelize.import(__dirname + '/models/anniversary.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);
db.shopping.belongsTo(db.user);
db.user.hasMany(db.shopping);
db.travel.belongsTo(db.user);
db.user.hasMany(db.travel);
db.anniversary.belongsTo(db.user);
db.user.hasMany(db.anniversary);
module.exports = db;