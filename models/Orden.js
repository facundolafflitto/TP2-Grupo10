const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Orden = sequelize.define('Orden', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  CompradorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  FechaOrden: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Estado: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'Ordenes',
  timestamps: false
});

module.exports = Orden;
