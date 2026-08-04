const db = require("../db");
const obtenerGrupos = (req, res) => {
    const sql = `
        SELECT
            ID,
            Nombre
        FROM grupos
        ORDER BY Nombre
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al obtener los grupos"
            });
        }
        res.json(results);
    });
};

module.exports = {
    obtenerGrupos
};