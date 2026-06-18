const { Op } = require("sequelize");
const { Producto, Categoria, Usuario } = require("../models");

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

function puedeAdministrarProducto(req, producto) {
    const roles = req.usuarioActual.roles;
    return roles.includes("ADMIN") || producto.VendedorId === req.usuarioActual.id;
}

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

        const respuesta = productos.map(formatearProducto);

        res.json(respuesta);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
}

async function obtenerProducto(req, res) {
    try {
        const producto = await buscarProductoConRelaciones(req.params.id);

        if (!producto || !producto.Activo) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(formatearProducto(producto));
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener producto"
        });
    }
}

async function crearProducto(req, res) {
    try {
        const errores = validarDatosProducto(req.body, false);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: "Datos invalidos",
                errores: errores
            });
        }

        const categoria = await Categoria.findByPk(req.body.categoriaId);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoria no encontrada"
            });
        }

        const producto = await Producto.create({
            VendedorId: req.usuarioActual.id,
            CategoriaId: Number(req.body.categoriaId),
            Titulo: String(req.body.titulo).trim(),
            Descripcion: req.body.descripcion ? String(req.body.descripcion).trim() : null,
            ImagenUrl: req.body.imagenUrl ? String(req.body.imagenUrl).trim() : null,
            Precio: Number(req.body.precio),
            Stock: Number(req.body.stock),
            Activo: true,
            FechaPublicacion: new Date()
        });

        const productoCompleto = await buscarProductoConRelaciones(producto.Id);

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            producto: formatearProducto(productoCompleto)
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });
    }
}

async function actualizarProducto(req, res) {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto || !producto.Activo) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        if (!puedeAdministrarProducto(req, producto)) {
            return res.status(403).json({
                mensaje: "Solo el vendedor del producto o un ADMIN puede editarlo"
            });
        }

        const errores = validarDatosProducto(req.body, true);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: "Datos invalidos",
                errores: errores
            });
        }

        if (req.body.categoriaId !== undefined) {
            const categoria = await Categoria.findByPk(req.body.categoriaId);

            if (!categoria) {
                return res.status(404).json({
                    mensaje: "Categoria no encontrada"
                });
            }

            producto.CategoriaId = Number(req.body.categoriaId);
        }

        if (req.body.titulo !== undefined) {
            producto.Titulo = String(req.body.titulo).trim();
        }

        if (req.body.descripcion !== undefined) {
            producto.Descripcion = req.body.descripcion ? String(req.body.descripcion).trim() : null;
        }

        if (req.body.imagenUrl !== undefined) {
            producto.ImagenUrl = req.body.imagenUrl ? String(req.body.imagenUrl).trim() : null;
        }

        if (req.body.precio !== undefined) {
            producto.Precio = Number(req.body.precio);
        }

        if (req.body.stock !== undefined) {
            producto.Stock = Number(req.body.stock);
        }

        await producto.save();

        const productoCompleto = await buscarProductoConRelaciones(producto.Id);

        res.json({
            mensaje: "Producto actualizado correctamente",
            producto: formatearProducto(productoCompleto)
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
}

async function eliminarProducto(req, res) {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto || !producto.Activo) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        if (!puedeAdministrarProducto(req, producto)) {
            return res.status(403).json({
                mensaje: "Solo el vendedor del producto o un ADMIN puede eliminarlo"
            });
        }

        producto.Activo = false;
        await producto.save();

        res.json({
            mensaje: "Producto eliminado correctamente"
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al eliminar producto"
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
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    reponerStock
};
