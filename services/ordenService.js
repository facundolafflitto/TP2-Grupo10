const { sequelize, Orden, OrdenDetalle, Producto, Usuario } = require("../models");

function crearError(status, mensaje) {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

async function asegurarTablaDetalle() {
    await OrdenDetalle.sync();
}

function formatearOrden(orden) {
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

async function listarOrdenes(usuarioActual) {
    await asegurarTablaDetalle();

    const esAdmin = usuarioActual.roles.includes("ADMIN");
    const ordenes = await Orden.findAll({
        where: esAdmin ? undefined : {
            CompradorId: usuarioActual.id
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

    return ordenes.map(formatearOrden);
}

async function crearOrden(datos, usuarioActual) {
    const itemsRecibidos = Array.isArray(datos.items)
        ? datos.items
        : [{
            productoId: datos.productoId,
            cantidad: datos.cantidad || 1
        }];

    if (itemsRecibidos.length === 0) {
        throw crearError(400, "La compra tiene que tener al menos un producto");
    }

    const itemsAgrupados = agruparItems(itemsRecibidos);

    if (itemsAgrupados.length === 0) {
        throw crearError(400, "Datos de compra invalidos");
    }

    const transaction = await sequelize.transaction();

    try {
        await asegurarTablaDetalle();

        const usuario = await Usuario.findByPk(usuarioActual.id, { transaction });

        if (!usuario || !usuario.Activo) {
            throw crearError(404, "Usuario no encontrado");
        }

        const detallesCompra = [];

        for (const item of itemsAgrupados) {
            const producto = await Producto.findByPk(item.productoId, { transaction });

            if (!producto || !producto.Activo) {
                throw crearError(404, "Producto no encontrado");
            }

            if (producto.Stock < item.cantidad) {
                throw crearError(400, "No hay stock suficiente para " + producto.Titulo);
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

        return {
            id: orden.Id,
            estado: orden.Estado,
            total: total.toFixed(2),
            cantidadItems: detallesCompra.length
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    listarOrdenes,
    crearOrden
};
