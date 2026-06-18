const express = require("express");
const productoController = require("../controllers/productoController");
const { autenticarUsuario } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", productoController.listarProductos);
router.get("/:id", productoController.obtenerProducto);
router.post("/", autenticarUsuario, productoController.crearProducto);
router.put("/:id", autenticarUsuario, productoController.actualizarProducto);
router.delete("/:id", autenticarUsuario, productoController.eliminarProducto);
router.patch("/:id/stock", autenticarUsuario, productoController.reponerStock);

module.exports = router;
