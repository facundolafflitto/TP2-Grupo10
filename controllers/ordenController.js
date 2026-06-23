const ordenService = require("../services/ordenService");

function responderError(res, error, mensajePorDefecto) {
    console.log(error);

    res.status(error.status || 500).json({
        mensaje: error.status ? error.message : mensajePorDefecto
    });
}

async function listarOrdenes(req, res) {
    try {
        const ordenes = await ordenService.listarOrdenes(req.usuarioActual);
        res.json(ordenes);
    } catch (error) {
        responderError(res, error, "Error al obtener ordenes");
    }
}

async function crearOrden(req, res) {
    try {
        const orden = await ordenService.crearOrden(req.body, req.usuarioActual);

        res.status(201).json({
            mensaje: "Compra realizada correctamente",
            orden: orden
        });
    } catch (error) {
        responderError(res, error, "Error al crear la orden");
    }
}

module.exports = {
    listarOrdenes,
    crearOrden
};
