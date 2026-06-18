const express = require("express");
const ordenController = require("../controllers/ordenController");
const { autenticarUsuario } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticarUsuario, ordenController.listarOrdenes);
router.post("/", autenticarUsuario, ordenController.crearOrden);

module.exports = router;
