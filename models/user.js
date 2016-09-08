module.exports = function(sequelize, DateTypes) {
	return sequelize.define('user', {
		email: {
			type: DateTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DateTypes.STRING,
			allowNull: false,
			validate: {
				len: [8, 16]
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options){
				//user.email convert to lower case if it is string 
				if(typeof user.email=== 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		}
	});
}