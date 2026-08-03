const db = require("../db");
const completarTramite = (req, res) => {
    const {
        alumnoId,
        tramiteId
    } = req.body;

    const sql = `
        INSERT INTO estatusalumnotramite
        (
            Alumno_Id,
            Tramite_Id,
            Estado,
            Fecha_asignacion,
            Fecha_completado,
            Notas_alumnos,
            Notas_admin
        )
        VALUES (?, ?, 'Completado', NOW(), NOW(), '', '')
    `;
    db.query(sql, [alumnoId, tramiteId], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    mensaje: "Este trámite ya fue marcado como completado."
                });
            }
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al guardar el trámite"
            });
        }
        res.json({
            mensaje: "Trámite completado correctamente"
        });

    });
};
const obtenerTramitesCompletados = (req, res) => {
    const { alumnoId } = req.params;
    const sql = `
        SELECT
            Tramite_Id,
            Fecha_completado,
            Estado,
            Notas_alumnos,
            Notas_admin
        FROM estatusalumnotramite
        WHERE Alumno_Id = ?
    `;
    db.query(sql, [alumnoId], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al obtener los trámites"
            });
        }
        res.json(results);
    });
};

const reabrirTramite = (req, res) => {
    const { alumnoId, tramiteId } = req.params;
    const sql = `
        DELETE FROM estatusalumnotramite
        WHERE Alumno_Id = ?
        AND Tramite_Id = ?
    `;
    db.query(sql, [alumnoId, tramiteId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al reabrir el trámite"
            });
        }
        res.json({
            mensaje: "Trámite reabierto correctamente"
        });
    });
};

const obtenerReporteTramite = (req, res) => {
    const { tramiteId } = req.params;
    const sql = `
        SELECT
            a.Matricula AS matricula,
            a.Nombre AS nombre,
            e.Estado AS estado,
            e.Fecha_completado AS fecha
        FROM estatusalumnotramite e
        INNER JOIN alumnos a
            ON e.Alumno_Id = a.ID
        WHERE e.Tramite_Id = ?
        ORDER BY a.Nombre
    `;
    db.query(sql, [tramiteId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al obtener el reporte"
            });
        }
        res.json(results);
    });
};

module.exports = {
    completarTramite,
    obtenerTramitesCompletados,
    reabrirTramite,
    obtenerReporteTramite
};