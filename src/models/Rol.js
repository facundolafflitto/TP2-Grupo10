const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true }
}, {
  tableName: 'Roles',
  timestamps: false
});

module.exports = Rol;