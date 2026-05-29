const express = require("express");

const app = express();

app.get("/", function(req, res) {
    res.send("Servidor funcionando");
});

app.listen(3000, function() {
    console.log("Servidor en puerto 3000");
});