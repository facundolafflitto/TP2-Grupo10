const { Categoria, Producto } = require("../models");

function formatearCategoria(categoria) {
    return {
        id: categoria.Id,
        nombre: categoria.Nombre
    };
}

function validarNombre(nombre) {
    return nombre && String(nombre).trim().length >= 3;
}

async function listarCategorias(req, res) {
    try {
        const categorias = await Categoria.findAll({
            order: [["Nombre", "ASC"]]
        });

        res.json(categorias.map(formatearCategoria));
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener categorias"
        });
    }
}

async function obtenerCategoria(req, res) {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoria no encontrada"
            });
        }

        res.json(formatearCategoria(categoria));
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener categoria"
        });
    }
}

async function crearCategoria(req, res) {
    try {
        if (!validarNombre(req.body.nombre)) {
            return res.status(400).json({
                mensaje: "El nombre debe tener al menos 3 caracteres"
            });
        }

        const categoria = await Categoria.create({
            Nombre: String(req.body.nombre).trim()
        });

        res.status(201).json({
            mensaje: "Categoria creada correctamente",
            categoria: formatearCategoria(categoria)
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear categoria"
        });
    }
}

async function actualizarCategoria(req, res) {
    try {
        if (!validarNombre(req.body.nombre)) {
            return res.status(400).json({
                mensaje: "El nombre debe tener al menos 3 caracteres"
            });
        }

        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoria no encontrada"
            });
        }

        categoria.Nombre = String(req.body.nombre).trim();
        await categoria.save();

        res.json({
            mensaje: "Categoria actualizada correctamente",
            categoria: formatearCategoria(categoria)
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al actualizar categoria"
        });
    }
}

async function eliminarCategoria(req, res) {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoria no encontrada"
            });
        }

        const productosAsociados = await Producto.count({
            where: {
                CategoriaId: categoria.Id,
                Activo: true
            }
        });

        if (productosAsociados > 0) {
            return res.status(409).json({
                mensaje: "No se puede eliminar una categoria con productos activos"
            });
        }

        await categoria.destroy();

        res.json({
            mensaje: "Categoria eliminada correctamente"
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al eliminar categoria"
        });
    }
}

module.exports = {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};
