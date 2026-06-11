const express = require("express");
const productoController = require("../controllers/productoController");
const { autenticarUsuario } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", productoController.listarProductos);
router.patch("/:id/stock", autenticarUsuario, productoController.reponerStock);

module.exports = router;
