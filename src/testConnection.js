const sequelize = require('./config/database');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');
    } catch (error) {
        console.error('❌ Error de conexión');
        console.error(error);
    }
}

testConnection();