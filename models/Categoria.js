const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Categoria = sequelize.define('Categoria', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, {
  tableName: 'Categorias',
  timestamps: false
});

module.exports = Categoria;
