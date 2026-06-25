const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, UsuarioRol, Rol } = require("../models");

function emailTieneFormatoValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res) {
    try {

        const nombre = req.body.nombre;
        const email = req.body.email ? String(req.body.email).trim().toLowerCase() : "";
        const password = req.body.password;
        const rolSolicitado = String(req.body.rol || "USUARIO").toUpperCase();
        const adminCode = req.body.adminCode;
        const rolesPermitidos = ["USUARIO", "ADMIN"];

        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: "Nombre, email y password son obligatorios"
            });
        }

        if (!emailTieneFormatoValido(email)) {
            return res.status(400).json({
                mensaje: "El email debe tener un formato valido"
            });
        }

        if (!rolesPermitidos.includes(rolSolicitado)) {
            return res.status(400).json({
                mensaje: "Rol invalido"
            });
        }

        if (rolSolicitado === "ADMIN" && adminCode !== process.env.ADMIN_REGISTER_CODE) {
            return res.status(403).json({
                mensaje: "Codigo de administrador invalido"
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: {
                Email: email
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                mensaje: "El email ya existe"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const usuario = await Usuario.create({
            Nombre: nombre,
            Email: email,
            PasswordHash: passwordHash,
            FechaRegistro: new Date(),
            Activo: true
        });

        const rol = await Rol.findOne({
            where: {
                Nombre: rolSolicitado
            }
        });

        if (!rol) {
            return res.status(500).json({
                mensaje: "Rol no configurado en la base de datos"
            });
        }

        await UsuarioRol.create({
            UsuarioId: usuario.Id,
            RolId: rol.Id
        });

        res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            rol: rol.Nombre
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al registrar usuario"
        });
    }
}

async function login(req, res) {
    try {
        const email = req.body.email ? String(req.body.email).trim().toLowerCase() : "";
        const password = req.body.password;

        if (!emailTieneFormatoValido(email)) {
            return res.status(400).json({
                mensaje: "El email debe tener un formato valido"
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                Email: email,
                Activo: true
            },
            include: [
                {
                    model: Rol,
                    attributes: ["Id", "Nombre"],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: "Email o password incorrectos"
            });
        }

        const passwordValida = await bcrypt.compare(password, usuario.PasswordHash);

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: "Email o password incorrectos"
            });
        }

        const roles = usuario.Rols.map(function(rol) {
            return rol.Nombre;
        });
        const token = jwt.sign({
            usuarioId: usuario.Id,
            roles: roles
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "8h"
        });

        res.json({
            mensaje: "Login correcto",
            token: token,
            usuario: {
                id: usuario.Id,
                nombre: usuario.Nombre,
                email: usuario.Email,
                roles: roles
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al iniciar sesion"
        });
    }
}

module.exports = {
    register,
    login
};
