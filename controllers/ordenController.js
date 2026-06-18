const { sequelize, Orden, OrdenDetalle, Producto, Usuario } = require("../models");

async function asegurarTablaDetalle() {
    await OrdenDetalle.sync();
}

async function listarOrdenes(req, res) {
    try {
        await asegurarTablaDetalle();

        const esAdmin = req.usuarioActual.roles.includes("ADMIN");
        const ordenes = await Orden.findAll({
            where: esAdmin ? undefined : {
                CompradorId: req.usuarioActual.id
            },
            include: [
                {
                    model: Usuario,
                    as: "Comprador",
                    attributes: ["Id", "Nombre"]
                },
                {
                    model: OrdenDetalle,
                    as: "Detalles",
                    include: [
                        {
                            model: Producto,
                            as: "Producto",
                            attributes: ["Id", "Titulo"]
                        }
                    ]
                }
            ],
            order: [["FechaOrden", "DESC"]]
        });

        const respuesta = ordenes.map(function(orden) {
            const detalles = orden.Detalles || [];
            const total = detalles.reduce(function(acumulado, detalle) {
                return acumulado + Number(detalle.Cantidad) * Number(detalle.PrecioUnitario);
            }, 0);

            return {
                id: orden.Id,
                compradorId: orden.CompradorId,
                comprador: orden.Comprador ? orden.Comprador.Nombre : "Sin comprador",
                fechaOrden: orden.FechaOrden,
                estado: orden.Estado,
                total: total.toFixed(2),
                detalles: detalles.map(function(detalle) {
                    return {
                        id: detalle.Id,
                        productoId: detalle.ProductoId,
                        producto: detalle.Producto ? detalle.Producto.Titulo : "Sin producto",
                        cantidad: detalle.Cantidad,
                        precioUnitario: detalle.PrecioUnitario
                    };
                })
            };
        });

        res.json(respuesta);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener ordenes"
        });
    }
}

async function crearOrden(req, res) {
    const productoId = Number(req.body.productoId);
    const cantidad = Number(req.body.cantidad || 1);

    if (!productoId || cantidad < 1) {
        return res.status(400).json({
            mensaje: "Datos de compra inválidos"
        });
    }

    const transaction = await sequelize.transaction();

    try {
        await asegurarTablaDetalle();

        const usuario = await Usuario.findByPk(req.usuarioActual.id, { transaction });

        if (!usuario || !usuario.Activo) {
            await transaction.rollback();
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const producto = await Producto.findByPk(productoId, { transaction });

        if (!producto || !producto.Activo) {
            await transaction.rollback();
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        if (producto.Stock < cantidad) {
            await transaction.rollback();
            return res.status(400).json({
                mensaje: "No hay stock suficiente"
            });
        }

        const orden = await Orden.create({
            CompradorId: usuario.Id,
            FechaOrden: new Date(),
            Estado: "Completada"
        }, { transaction });

        await OrdenDetalle.create({
            OrdenId: orden.Id,
            ProductoId: producto.Id,
            Cantidad: cantidad,
            PrecioUnitario: producto.Precio
        }, { transaction });

        producto.Stock = producto.Stock - cantidad;
        await producto.save({ transaction });

        await transaction.commit();

        res.status(201).json({
            mensaje: "Compra realizada correctamente",
            orden: {
                id: orden.Id,
                estado: orden.Estado,
                total: (Number(producto.Precio) * cantidad).toFixed(2)
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear la orden"
        });
    }
}

module.exports = {
    listarOrdenes,
    crearOrden
};
