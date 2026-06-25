const sequelize = require("../connection/database");

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
    foreignKey: "VendedorId",
    as: "Productos"
});

Producto.belongsTo(Usuario, {
    foreignKey: "VendedorId",
    as: "Vendedor"
});

// Categoria -> Producto
Categoria.hasMany(Producto, {
    foreignKey: "CategoriaId",
    as: "Productos"
});

Producto.belongsTo(Categoria, {
    foreignKey: "CategoriaId",
    as: "Categoria"
});

// Usuario -> Orden
Usuario.hasMany(Orden, {
    foreignKey: "CompradorId",
    as: "Ordenes"
});

Orden.belongsTo(Usuario, {
    foreignKey: "CompradorId",
    as: "Comprador"
});

// Orden -> OrdenDetalle
Orden.hasMany(OrdenDetalle, {
    foreignKey: "OrdenId",
    as: "Detalles",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION"
});

OrdenDetalle.belongsTo(Orden, {
    foreignKey: "OrdenId",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION"
});

// Producto -> OrdenDetalle
Producto.hasMany(OrdenDetalle, {
    foreignKey: "ProductoId",
    as: "Detalles",
    onDelete: "SET NULL",
    onUpdate: "NO ACTION"
});

OrdenDetalle.belongsTo(Producto, {
    foreignKey: "ProductoId",
    as: "Producto",
    onDelete: "SET NULL",
    onUpdate: "NO ACTION"
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
