module.exports = function(sequelize, DataTypes) {
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}

		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 100]
			}

		},
		date: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

};