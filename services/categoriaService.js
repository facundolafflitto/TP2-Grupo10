const { Categoria, Producto } = require("../models");

function crearError(status, mensaje) {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

function formatearCategoria(categoria) {
    return {
        id: categoria.Id,
        nombre: categoria.Nombre
    };
}

function validarNombre(nombre) {
    return nombre && String(nombre).trim().length >= 3;
}

async function listarCategorias() {
    const categorias = await Categoria.findAll({
        order: [["Nombre", "ASC"]]
    });

    return categorias.map(formatearCategoria);
}

async function obtenerCategoria(id) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
        throw crearError(404, "Categoria no encontrada");
    }

    return formatearCategoria(categoria);
}

async function crearCategoria(datos) {
    if (!validarNombre(datos.nombre)) {
        throw crearError(400, "El nombre debe tener al menos 3 caracteres");
    }

    const nombre = String(datos.nombre).trim();
    const categoriaExistente = await Categoria.findOne({
        where: {
            Nombre: nombre
        }
    });

    if (categoriaExistente) {
        throw crearError(409, "La categoria ya existe");
    }

    const categoria = await Categoria.create({
        Nombre: nombre
    });

    return formatearCategoria(categoria);
}

async function actualizarCategoria(id, datos) {
    if (!validarNombre(datos.nombre)) {
        throw crearError(400, "El nombre debe tener al menos 3 caracteres");
    }

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
        throw crearError(404, "Categoria no encontrada");
    }

    categoria.Nombre = String(datos.nombre).trim();
    await categoria.save();

    return formatearCategoria(categoria);
}

async function eliminarCategoria(id) {
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
        throw crearError(404, "Categoria no encontrada");
    }

    const productosAsociados = await Producto.count({
        where: {
            CategoriaId: categoria.Id,
            Activo: true
        }
    });

    if (productosAsociados > 0) {
        throw crearError(409, "No se puede eliminar una categoria con productos activos");
    }

    await categoria.destroy();
}

module.exports = {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};
