const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");

async function autenticarUsuario(req, res, next) {
    try {
        const authorization = req.headers.authorization || "";
        const parts = authorization.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
            return res.status(401).json({
                mensaje: "Token de autenticacion requerido"
            });
        }

        let payload;

        try {
            payload = jwt.verify(parts[1], process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                mensaje: "Token invalido o vencido"
            });
        }

        const usuario = await Usuario.findByPk(payload.usuarioId, {
            include: [
                {
                    model: Rol,
                    attributes: ["Nombre"],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        if (!usuario || !usuario.Activo) {
            return res.status(401).json({
                mensaje: "Usuario no autorizado"
            });
        }

        req.usuarioActual = {
            id: usuario.Id,
            nombre: usuario.Nombre,
            email: usuario.Email,
            roles: usuario.Rols.map(function(rol) {
                return rol.Nombre;
            })
        };

        next();
    } catch (error) {
        next(error);
    }
}

function requiereRol(rolesPermitidos) {
    return function(req, res, next) {
        const rolesUsuario = req.usuarioActual ? req.usuarioActual.roles : [];
        const tieneRol = rolesPermitidos.some(function(rol) {
            return rolesUsuario.includes(rol);
        });

        if (!tieneRol) {
            return res.status(403).json({
                mensaje: "No tenes permisos para realizar esta accion"
            });
        }

        next();
    };
}

module.exports = {
    autenticarUsuario,
    requiereRol
};
