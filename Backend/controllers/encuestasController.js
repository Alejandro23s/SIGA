const db = require("../db");

// Obtener todas las encuestas
const obtenerEncuestas = (req, res) => {
    const sql = `
        SELECT
            e.ID,
            a.Nombre AS alumno,
            a.Matricula AS matricula,
            e.Priorizacion,
            e.FacilidadCelular,
            e.ClaridadInformacion,
            e.Comentarios,
            e.Fecha
        FROM encuestas_sistema e

        INNER JOIN alumnos a
            ON e.Alumno_Id = a.ID

        ORDER BY e.Fecha DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al obtener las encuestas"
            });
        }
        res.json(results);
    });

};

// Guardar encuesta
const crearEncuesta = (req, res) => {
    const {
        alumnoId,
        priorizacion,
        facilidadCelular,
        claridadInformacion,
        comentarios
    } = req.body;

    const sql = `
        INSERT INTO encuestas_sistema
        (
            Alumno_Id,
            Priorizacion,
            FacilidadCelular,
            ClaridadInformacion,
            Comentarios
        )
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [
            alumnoId,
            priorizacion,
            facilidadCelular,
            claridadInformacion,
            comentarios
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al guardar la encuesta"
                });

            }
            res.status(201).json({
                mensaje: "Encuesta guardada correctamente"
            });
        }
    );

};
module.exports = {
    obtenerEncuestas,
    crearEncuesta
};