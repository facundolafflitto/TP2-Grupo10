const categoriaService = require("../services/categoriaService");

function responderError(res, error, mensajePorDefecto) {
    console.log(error);

    res.status(error.status || 500).json({
        mensaje: error.status ? error.message : mensajePorDefecto
    });
}

async function listarCategorias(req, res) {
    try {
        const categorias = await categoriaService.listarCategorias();
        res.json(categorias);
    } catch (error) {
        responderError(res, error, "Error al obtener categorias");
    }
}

async function obtenerCategoria(req, res) {
    try {
        const categoria = await categoriaService.obtenerCategoria(req.params.id);
        res.json(categoria);
    } catch (error) {
        responderError(res, error, "Error al obtener categoria");
    }
}

async function crearCategoria(req, res) {
    try {
        const categoria = await categoriaService.crearCategoria(req.body);

        res.status(201).json({
            mensaje: "Categoria creada correctamente",
            categoria: categoria
        });
    } catch (error) {
        responderError(res, error, "Error al crear categoria");
    }
}

async function actualizarCategoria(req, res) {
    try {
        const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);

        res.json({
            mensaje: "Categoria actualizada correctamente",
            categoria: categoria
        });
    } catch (error) {
        responderError(res, error, "Error al actualizar categoria");
    }
}

async function eliminarCategoria(req, res) {
    try {
        await categoriaService.eliminarCategoria(req.params.id);

        res.json({
            mensaje: "Categoria eliminada correctamente"
        });
    } catch (error) {
        responderError(res, error, "Error al eliminar categoria");
    }
}

module.exports = {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};
