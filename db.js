const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
//  connectionString: DB_URI
    user: 'postgres',
    password: 'sammydog12',
    host: 'localhost',
    database: 'biztime',
    port: 5432

});

db.connect();

module.exports = db