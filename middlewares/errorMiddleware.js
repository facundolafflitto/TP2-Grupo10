function notFoundApi(req, res, next) {
    res.status(404).json({
        mensaje: "Ruta de API no encontrada"
    });
}

function manejarErrores(error, req, res, next) {
    console.log(error);

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });
}

module.exports = {
    notFoundApi,
    manejarErrores
};
