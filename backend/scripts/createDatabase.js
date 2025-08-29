const mysql = require("mysql2/promise");
require("dotenv").config();

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });

    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "bidhub_db"}`
    );
    console.log(
      `✅ Base de données '${
        process.env.DB_NAME || "bidhub_db"
      }' créée avec succès`
    );

    await connection.end();
  } catch (error) {
    console.error("❌ Erreur création base de données:", error);
  }
};

createDatabase();
