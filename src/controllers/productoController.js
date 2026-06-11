const { Op } = require("sequelize");
const { Producto, Categoria, Usuario } = require("../models");

async function listarProductos(req, res) {
    try {
        const categoria = req.query.categoria;
        const productos = await Producto.findAll({
            where: {
                Activo: true
            },
            include: [
                {
                    model: Categoria,
                    as: "Categoria",
                    attributes: ["Id", "Nombre"],
                    where: categoria ? {
                        Nombre: {
                            [Op.like]: categoria
                        }
                    } : undefined
                },
                {
                    model: Usuario,
                    as: "Vendedor",
                    attributes: ["Id", "Nombre"]
                }
            ],
            order: [["FechaPublicacion", "DESC"]]
        });

        const respuesta = productos.map(function(producto) {
            return {
                id: producto.Id,
                vendedorId: producto.VendedorId,
                vendedor: producto.Vendedor ? producto.Vendedor.Nombre : "Sin vendedor",
                categoriaId: producto.CategoriaId,
                categoria: producto.Categoria ? producto.Categoria.Nombre : "Sin categoria",
                titulo: producto.Titulo,
                descripcion: producto.Descripcion,
                imagenUrl: producto.ImagenUrl,
                precio: producto.Precio,
                stock: producto.Stock,
                activo: producto.Activo,
                fechaPublicacion: producto.FechaPublicacion
            };
        });

        res.json(respuesta);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
}

async function reponerStock(req, res) {
    try {
        const productoId = Number(req.params.id);
        const cantidad = Number(req.body.cantidad);

        if (!productoId || !cantidad || cantidad < 1) {
            return res.status(400).json({
                mensaje: "Cantidad inválida"
            });
        }

        const producto = await Producto.findByPk(productoId);

        if (!producto || !producto.Activo) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        const roles = req.usuarioActual.roles;
        const esAdmin = roles.includes("ADMIN");
        const esVendedorDelProducto = producto.VendedorId === req.usuarioActual.id;

        if (!esAdmin && !esVendedorDelProducto) {
            return res.status(403).json({
                mensaje: "Solo el vendedor del producto o un ADMIN puede reponer stock"
            });
        }

        producto.Stock = producto.Stock + cantidad;
        await producto.save();

        res.json({
            mensaje: "Stock actualizado",
            producto: {
                id: producto.Id,
                titulo: producto.Titulo,
                stock: producto.Stock
            }
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al reponer stock"
        });
    }
}

module.exports = {
    listarProductos,
    reponerStock
};
