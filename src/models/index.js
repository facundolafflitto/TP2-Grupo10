const sequelize = require("../config/database");

const Usuario = require("./Usuario");
const Rol = require("./Rol");
const UsuarioRol = require("./UsuarioRol");
const Categoria = require("./Categoria");
const Producto = require("./Producto");
const Orden = require("./Orden");
const OrdenDetalle = require("./OrdenDetalle");

// Usuario <-> Rol
Usuario.belongsToMany(Rol, {
    through: UsuarioRol,
    foreignKey: "UsuarioId"
});

Rol.belongsToMany(Usuario, {
    through: UsuarioRol,
    foreignKey: "RolId"
});

// Usuario -> Producto
Usuario.hasMany(Producto, {
    foreignKey: "VendedorId"
});

Producto.belongsTo(Usuario, {
    foreignKey: "VendedorId"
});

// Categoria -> Producto
Categoria.hasMany(Producto, {
    foreignKey: "CategoriaId"
});

Producto.belongsTo(Categoria, {
    foreignKey: "CategoriaId"
});

// Usuario -> Orden
Usuario.hasMany(Orden, {
    foreignKey: "CompradorId"
});

Orden.belongsTo(Usuario, {
    foreignKey: "CompradorId"
});

// Orden -> OrdenDetalle
Orden.hasMany(OrdenDetalle, {
    foreignKey: "OrdenId"
});

OrdenDetalle.belongsTo(Orden, {
    foreignKey: "OrdenId"
});

// Producto -> OrdenDetalle
Producto.hasMany(OrdenDetalle, {
    foreignKey: "ProductoId"
});

OrdenDetalle.belongsTo(Producto, {
    foreignKey: "ProductoId"
});

module.exports = {
    sequelize,
    Usuario,
    Rol,
    UsuarioRol,
    Categoria,
    Producto,
    Orden,
    OrdenDetalle
};