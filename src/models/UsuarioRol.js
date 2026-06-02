const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsuarioRol = sequelize.define('UsuarioRol', {
  UsuarioId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  RolId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'UsuarioRoles',
  timestamps: false
});

module.exports = UsuarioRol;