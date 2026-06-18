const express = require("express");
const productoController = require("../controllers/productoController");
const { autenticarUsuario, requiereRol } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", productoController.listarProductos);
router.get("/:id", productoController.obtenerProducto);
router.post("/", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), productoController.crearProducto);
router.put("/:id", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), productoController.actualizarProducto);
router.delete("/:id", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), productoController.eliminarProducto);
router.patch("/:id/stock", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), productoController.reponerStock);

module.exports = router;
