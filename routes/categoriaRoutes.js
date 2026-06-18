const express = require("express");
const categoriaController = require("../controllers/categoriaController");
const { autenticarUsuario, requiereRol } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", categoriaController.listarCategorias);
router.get("/:id", categoriaController.obtenerCategoria);
router.post("/", autenticarUsuario, requiereRol(["ADMIN"]), categoriaController.crearCategoria);
router.put("/:id", autenticarUsuario, requiereRol(["ADMIN"]), categoriaController.actualizarCategoria);
router.delete("/:id", autenticarUsuario, requiereRol(["ADMIN"]), categoriaController.eliminarCategoria);

module.exports = router;
