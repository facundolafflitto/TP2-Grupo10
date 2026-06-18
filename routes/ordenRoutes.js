const express = require("express");
const ordenController = require("../controllers/ordenController");
const { autenticarUsuario, requiereRol } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), ordenController.listarOrdenes);
router.post("/", autenticarUsuario, requiereRol(["USUARIO", "ADMIN"]), ordenController.crearOrden);

module.exports = router;
