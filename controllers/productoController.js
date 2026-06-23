const productoService = require("../services/productoService");

function responderError(res, error, mensajePorDefecto) {
    console.log(error);

    const respuesta = {
        mensaje: error.status ? error.message : mensajePorDefecto
    };

    if (error.errores) {
        respuesta.errores = error.errores;
    }

    res.status(error.status || 500).json(respuesta);
}

async function listarProductos(req, res) {
    try {
        const productos = await productoService.listarProductos(req.query.categoria);
        res.json(productos);
    } catch (error) {
        responderError(res, error, "Error al obtener productos");
    }
}

async function obtenerProducto(req, res) {
    try {
        const producto = await productoService.obtenerProducto(req.params.id);
        res.json(producto);
    } catch (error) {
        responderError(res, error, "Error al obtener producto");
    }
}

async function crearProducto(req, res) {
    try {
        const producto = await productoService.crearProducto(req.body, req.usuarioActual);

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            producto: producto
        });
    } catch (error) {
        responderError(res, error, "Error al crear producto");
    }
}

async function actualizarProducto(req, res) {
    try {
        const producto = await productoService.actualizarProducto(req.params.id, req.body, req.usuarioActual);

        res.json({
            mensaje: "Producto actualizado correctamente",
            producto: producto
        });
    } catch (error) {
        responderError(res, error, "Error al actualizar producto");
    }
}

async function eliminarProducto(req, res) {
    try {
        await productoService.eliminarProducto(req.params.id, req.usuarioActual);

        res.json({
            mensaje: "Producto eliminado correctamente"
        });
    } catch (error) {
        responderError(res, error, "Error al eliminar producto");
    }
}

async function reponerStock(req, res) {
    try {
        const producto = await productoService.reponerStock(req.params.id, req.body.cantidad, req.usuarioActual);

        res.json({
            mensaje: "Stock actualizado",
            producto: producto
        });
    } catch (error) {
        responderError(res, error, "Error al reponer stock");
    }
}

module.exports = {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    reponerStock
};
