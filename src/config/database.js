const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'MarketplaceTP',
  'marketplace_user',
  'Marketplace123!',
  {
    host: '127.0.0.1',
    port: 1433,
    dialect: 'mssql',
    dialectModule: require('tedious'),
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    logging: false
  }
);

module.exports = sequelize;