require("dotenv").config();

const express = require("express");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const requestLogger = require("./middlewares/requestLogger");
const { notFoundApi, manejarErrores } = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error("Falta configurar DB_NAME, DB_USER y DB_PASSWORD en el archivo .env");
}

app.use(express.json());
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
app.use("/api/categorias", categoriaRoutes);
app.use("/api/ordenes", ordenRoutes);
app.use("/api", notFoundApi);

app.use(manejarErrores);

app.listen(PORT, function() {
    console.log("Servidor en puerto " + PORT);
});
