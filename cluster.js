"use strict";

module.exports = function(sequelize, DataTypes) {
	var Cluster = sequelize.define("Cluster", {
		clusterId: {
			type: DataTypes.INTEGER(5),
			autoIncrement: true,
			primaryKey: true
		},
		clusterName: {
			type: DataTypes.STRING(45),
			allowNull: false
		},
		clusterRegDate: {
			type: DataTypes.DATE,
			allowNull: false
		},
		districtId: {
			type: DataTypes.INTEGER(5),
			allowNull: false
		},
		clusterClosingDate: {
			type: DataTypes.DATE,
			allowNull: false
		},
		statusId: {
			type: DataTypes.INTEGER(5),
			allowNull: false
		},
		createdBy: {
			type: DataTypes.INTEGER(5),
			allowNull: false
		},
		lastUpdatedBy: {
			type: DataTypes.INTEGER(5),
			allowNull: false
		},
		createdDate: {
			type: DataTypes.DATE,
			allowNull: false
		},
		lastUpdatedDate: {
			type: DataTypes.DATE,
			allowNull: false
		}
	},
	{
		tableName: 'Cluster',
		timestamps: false
	});
	return Cluster;
}