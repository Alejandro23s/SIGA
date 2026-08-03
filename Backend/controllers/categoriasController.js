const db = require("../db");

const obtenerCategorias = (req, res) => {

    db.query(
        "SELECT ID, Nombre FROM categorias ORDER BY Nombre",
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al obtener categorías"
                });
            }

            res.json(results);

        }
    );

};

module.exports = {
    obtenerCategorias
};