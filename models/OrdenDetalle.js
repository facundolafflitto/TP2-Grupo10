const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const OrdenDetalle = sequelize.define('OrdenDetalle', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  OrdenId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProductoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  PrecioUnitario: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  }
}, {
  tableName: 'OrdenDetalles',
  timestamps: false
});

module.exports = OrdenDetalle;
