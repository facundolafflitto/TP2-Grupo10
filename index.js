require("dotenv").config();

const express = require("express");
const path = require("path");
const { sequelize } = require("./src/models");
const authRoutes = require("./src/routes/authRoutes");
const productoRoutes = require("./src/routes/productoRoutes");
const ordenRoutes = require("./src/routes/ordenRoutes");
const requestLogger = require("./src/middlewares/requestLogger");
const { notFoundApi, manejarErrores } = require("./src/middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}

app.use(express.json());
app.use(express.static("public"));
app.use(requestLogger);

sequelize.authenticate()
.then(function () {
    console.log("Conexión exitosa");
})
.catch(function (error) {
    console.log(error);
});

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ordenes", ordenRoutes);
app.use("/api", notFoundApi);

app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(manejarErrores);

app.listen(PORT, function() {
    console.log("Servidor en puerto " + PORT);
});
