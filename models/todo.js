module.exports = function(sequelize, DataTypes) {
	return sequelize.define('todo', {
		title: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 100]
			}
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}

		},
		date: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

};