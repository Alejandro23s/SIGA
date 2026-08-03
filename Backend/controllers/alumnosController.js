const db = require("../db");

const obtenerAlumnos = (req, res) => {
    db.query("SELECT * FROM alumnos", (err, results) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error" });
        }

        res.json(results);
    });
};

const obtenerAlumnoPorMatricula = (req, res) => {

    const matricula = req.params.matricula;

    const sql = `
        SELECT *
        FROM alumnos
        WHERE Matricula = ?
    `;

    db.query(sql, [matricula], (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensaje: "Alumno no encontrado"
            });
        }

        res.json(results[0]);

    });

};

module.exports = {
    obtenerAlumnos,
    obtenerAlumnoPorMatricula
};