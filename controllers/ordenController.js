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

function agruparItems(itemsRecibidos) {
    const itemsAgrupados = [];

    itemsRecibidos.forEach(function(item) {
        const productoId = Number(item.productoId);
        const cantidad = Number(item.cantidad || 1);

        if (!productoId || !Number.isInteger(cantidad) || cantidad < 1) {
            return;
        }

        const itemExistente = itemsAgrupados.find(function(itemAgrupado) {
            return itemAgrupado.productoId === productoId;
        });

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            itemsAgrupados.push({
                productoId: productoId,
                cantidad: cantidad
            });
        }
    });

    return itemsAgrupados;
}

async function crearOrden(req, res) {
    const itemsRecibidos = Array.isArray(req.body.items)
        ? req.body.items
        : [{
            productoId: req.body.productoId,
            cantidad: req.body.cantidad || 1
        }];

    if (itemsRecibidos.length === 0) {
        return res.status(400).json({
            mensaje: "La compra tiene que tener al menos un producto"
        });
    }

    const itemsAgrupados = agruparItems(itemsRecibidos);

    if (itemsAgrupados.length === 0) {
        return res.status(400).json({
            mensaje: "Datos de compra invalidos"
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

        const detallesCompra = [];

        for (const item of itemsAgrupados) {
            const producto = await Producto.findByPk(item.productoId, { transaction });

            if (!producto || !producto.Activo) {
                await transaction.rollback();
                return res.status(404).json({
                    mensaje: "Producto no encontrado"
                });
            }

            if (producto.Stock < item.cantidad) {
                await transaction.rollback();
                return res.status(400).json({
                    mensaje: "No hay stock suficiente para " + producto.Titulo
                });
            }

            detallesCompra.push({
                producto: producto,
                cantidad: item.cantidad
            });
        }

        const orden = await Orden.create({
            CompradorId: usuario.Id,
            FechaOrden: new Date(),
            Estado: "Completada"
        }, { transaction });

        let total = 0;

        for (const detalle of detallesCompra) {
            await OrdenDetalle.create({
                OrdenId: orden.Id,
                ProductoId: detalle.producto.Id,
                Cantidad: detalle.cantidad,
                PrecioUnitario: detalle.producto.Precio
            }, { transaction });

            detalle.producto.Stock = detalle.producto.Stock - detalle.cantidad;
            await detalle.producto.save({ transaction });

            total += Number(detalle.producto.Precio) * detalle.cantidad;
        }

        await transaction.commit();

        res.status(201).json({
            mensaje: "Compra realizada correctamente",
            orden: {
                id: orden.Id,
                estado: orden.Estado,
                total: total.toFixed(2),
                cantidadItems: detallesCompra.length
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
