const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  VendedorId: { type: DataTypes.INTEGER, allowNull: false },
  CategoriaId: { type: DataTypes.INTEGER, allowNull: false },
  Titulo: { type: DataTypes.STRING(150), allowNull: false },
  Descripcion: { type: DataTypes.STRING(1000), allowNull: true },
  Precio: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
  Stock: { type: DataTypes.INTEGER, allowNull: false },
  Activo: { type: DataTypes.BOOLEAN, allowNull: false },
  FechaPublicacion: { type: DataTypes.DATE, allowNull: false }
}, {
  tableName: 'Productos',
  timestamps: false
});

module.exports = Producto;