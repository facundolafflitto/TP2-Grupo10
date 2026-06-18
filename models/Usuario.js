const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Usuario = sequelize.define('Usuario', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(100), allowNull: false },
  Email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  PasswordHash: { type: DataTypes.STRING(255), allowNull: false },
  FechaRegistro: { type: DataTypes.DATE, allowNull: false },
  Activo: { type: DataTypes.BOOLEAN, allowNull: false }
}, {
  tableName: 'Usuarios',
  timestamps: false
});

module.exports = Usuario;
