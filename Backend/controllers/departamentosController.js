const db = require("../db");

const obtenerDepartamentos = (req, res) => {

    db.query(
        "SELECT ID, Nombre FROM departamentos ORDER BY Nombre",
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al obtener departamentos"
                });
            }

            res.json(results);

        }
    );

};

module.exports = {
    obtenerDepartamentos
};