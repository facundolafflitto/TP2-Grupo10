require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 1433),
        dialect: "mssql",
        dialectModule: require("tedious"),
        dialectOptions: {
            options: {
                encrypt: process.env.DB_ENCRYPT === "true",
                trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false"
            }
        },
        logging: false
    }
);

module.exports = sequelize;
