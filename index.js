const express = require("express");
const { sequelize } = require("./models");

const app = express();

sequelize.sync({ alter: true })
.then(function () {
    console.log("Base sincronizada");
})
.catch(function (error) {
    console.log(error);
});

app.get("/", function(req, res) {
    res.send("Servidor funcionando");
});

app.listen(3000, function() {
    console.log("Servidor en puerto 3000");
});