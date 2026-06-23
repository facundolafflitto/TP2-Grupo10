const { Op } = require("sequelize");
const { Producto, Categoria, Usuario } = require("../models");

function crearError(status, mensaje, errores) {
    const error = new Error(mensaje);
    error.status = status;
    error.errores = errores;
    return error;
}

function formatearProducto(producto) {
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
}

function validarDatosProducto(datos, esActualizacion) {
    const errores = [];

    if (!esActualizacion || datos.titulo !== undefined) {
        if (!datos.titulo || String(datos.titulo).trim().length < 3) {
            errores.push("El titulo debe tener al menos 3 caracteres");
        }
    }

    if (!esActualizacion || datos.categoriaId !== undefined) {
        if (!Number(datos.categoriaId)) {
            errores.push("La categoria es obligatoria");
        }
    }

    if (!esActualizacion || datos.precio !== undefined) {
        if (!Number(datos.precio) || Number(datos.precio) <= 0) {
            errores.push("El precio debe ser mayor a 0");
        }
    }

    if (!esActualizacion || datos.stock !== undefined) {
        if (!Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0) {
            errores.push("El stock debe ser un numero entero mayor o igual a 0");
        }
    }

    return errores;
}

async function buscarProductoConRelaciones(id) {
    return Producto.findByPk(id, {
        include: [
            {
                model: Categoria,
                as: "Categoria",
                attributes: ["Id", "Nombre"]
            },
            {
                model: Usuario,
                as: "Vendedor",
                attributes: ["Id", "Nombre"]
            }
        ]
    });
}

function puedeAdministrarProducto(usuarioActual, producto) {
    const roles = usuarioActual.roles;
    return roles.includes("ADMIN") || producto.VendedorId === usuarioActual.id;
}

async function listarProductos(categoria) {
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

    return productos.map(formatearProducto);
}

async function obtenerProducto(id) {
    const producto = await buscarProductoConRelaciones(id);

    if (!producto || !producto.Activo) {
        throw crearError(404, "Producto no encontrado");
    }

    return formatearProducto(producto);
}

async function crearProducto(datos, usuarioActual) {
    const errores = validarDatosProducto(datos, false);

    if (errores.length > 0) {
        throw crearError(400, "Datos invalidos", errores);
    }

    const categoria = await Categoria.findByPk(datos.categoriaId);

    if (!categoria) {
        throw crearError(404, "Categoria no encontrada");
    }

    const producto = await Producto.create({
        VendedorId: usuarioActual.id,
        CategoriaId: Number(datos.categoriaId),
        Titulo: String(datos.titulo).trim(),
        Descripcion: datos.descripcion ? String(datos.descripcion).trim() : null,
        ImagenUrl: datos.imagenUrl ? String(datos.imagenUrl).trim() : null,
        Precio: Number(datos.precio),
        Stock: Number(datos.stock),
        Activo: true,
        FechaPublicacion: new Date()
    });

    const productoCompleto = await buscarProductoConRelaciones(producto.Id);
    return formatearProducto(productoCompleto);
}

async function actualizarProducto(id, datos, usuarioActual) {
    const producto = await Producto.findByPk(id);

    if (!producto || !producto.Activo) {
        throw crearError(404, "Producto no encontrado");
    }

    if (!puedeAdministrarProducto(usuarioActual, producto)) {
        throw crearError(403, "Solo el vendedor del producto o un ADMIN puede editarlo");
    }

    const errores = validarDatosProducto(datos, true);

    if (errores.length > 0) {
        throw crearError(400, "Datos invalidos", errores);
    }

    if (datos.categoriaId !== undefined) {
        const categoria = await Categoria.findByPk(datos.categoriaId);

        if (!categoria) {
            throw crearError(404, "Categoria no encontrada");
        }

        producto.CategoriaId = Number(datos.categoriaId);
    }

    if (datos.titulo !== undefined) {
        producto.Titulo = String(datos.titulo).trim();
    }

    if (datos.descripcion !== undefined) {
        producto.Descripcion = datos.descripcion ? String(datos.descripcion).trim() : null;
    }

    if (datos.imagenUrl !== undefined) {
        producto.ImagenUrl = datos.imagenUrl ? String(datos.imagenUrl).trim() : null;
    }

    if (datos.precio !== undefined) {
        producto.Precio = Number(datos.precio);
    }

    if (datos.stock !== undefined) {
        producto.Stock = Number(datos.stock);
    }

    await producto.save();

    const productoCompleto = await buscarProductoConRelaciones(producto.Id);
    return formatearProducto(productoCompleto);
}

async function eliminarProducto(id, usuarioActual) {
    const producto = await Producto.findByPk(id);

    if (!producto || !producto.Activo) {
        throw crearError(404, "Producto no encontrado");
    }

    if (!puedeAdministrarProducto(usuarioActual, producto)) {
        throw crearError(403, "Solo el vendedor del producto o un ADMIN puede eliminarlo");
    }

    producto.Activo = false;
    await producto.save();
}

async function reponerStock(id, cantidadRecibida, usuarioActual) {
    const productoId = Number(id);
    const cantidad = Number(cantidadRecibida);

    if (!productoId || !cantidad || cantidad < 1) {
        throw crearError(400, "Cantidad invalida");
    }

    const producto = await Producto.findByPk(productoId);

    if (!producto || !producto.Activo) {
        throw crearError(404, "Producto no encontrado");
    }

    if (!puedeAdministrarProducto(usuarioActual, producto)) {
        throw crearError(403, "Solo el vendedor del producto o un ADMIN puede reponer stock");
    }

    producto.Stock = producto.Stock + cantidad;
    await producto.save();

    return {
        id: producto.Id,
        titulo: producto.Titulo,
        stock: producto.Stock
    };
}

module.exports = {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    reponerStock
};
