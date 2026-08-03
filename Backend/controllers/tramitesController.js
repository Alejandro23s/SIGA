const db = require("../db");

const obtenerTramites = (req, res) => {

    const sql = `
    SELECT
        t.ID AS id,
        t.Titulo AS title,
        t.Descripcion AS description,
        t.Requisitos AS requirements,
        t.Lugar_atencion AS location,
        t.Fecha_limite AS deadline,
        t.TargetAudience AS targetAudience,
        t.SpecificMatricula AS specificMatricula,

        c.Nombre AS category,
        d.Nombre AS responsible

    FROM tramites t

    INNER JOIN departamentos d
        ON t.Departamento_Id = d.ID

    INNER JOIN categorias c
        ON t.Categoria_Id = c.ID
    `;
    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                mensaje: "Error al obtener los trámites"
            });
        }
        const tramites = results.map(t => {
            const fecha = new Date(t.deadline);
            const ahora = new Date();

            // Ignorar la hora
            fecha.setHours(0, 0, 0, 0);
            ahora.setHours(0, 0, 0, 0);

            const diferenciaDias = Math.floor(
                (fecha - ahora) / (1000 * 60 * 60 * 24)
            );
            let urgency = "ontime";
            let statusText = "Disponible";

            if (diferenciaDias <= 3) {
                urgency = "urgent";

                if (diferenciaDias < 0) {
                    statusText = "Vencido";
                } else if (diferenciaDias === 0) {
                    statusText = "Vence hoy";
                } else {
                    statusText = `Vence en ${diferenciaDias} día${diferenciaDias === 1 ? "" : "s"}`;
                }
            }
            return {
                ...t,
                deadlineText: fecha.toLocaleString("es-MX"),
                urgency,
                statusText,
                completed: false,
                targetAudience: t.targetAudience,
                specificMatricula: t.specificMatricula || ""
            };
        });
        res.json(tramites);
    });
};

const crearTramite = (req, res) => {

    const {
        departamentoId,
        categoriaId,
        titulo,
        descripcion,
        requisitos,
        lugarAtencion,
        fechaLimite,
        targetAudience,
        specificMatricula
    } = req.body;

    const sql = `
        INSERT INTO tramites
        (
            Departamento_Id,
            Categoria_Id,
            Titulo,
            Descripcion,
            Requisitos,
            Lugar_atencion,
            Fecha_limite,
            TargetAudience,
            SpecificMatricula
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            departamentoId,
            categoriaId,
            titulo,
            descripcion,
            requisitos,
            lugarAtencion,
            fechaLimite,
            targetAudience,
            specificMatricula
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al crear el trámite"
                });
            }
            res.status(201).json({
                mensaje: "Trámite creado correctamente"
            });
        }
    );
};
const editarTramite = (req, res) => {
    const { id } = req.params;
    const {
        departamentoId,
        categoriaId,
        titulo,
        descripcion,
        requisitos,
        lugarAtencion,
        fechaLimite,
        targetAudience,
        specificMatricula
    } = req.body;
    const sql = `
        UPDATE tramites
        SET
            Departamento_Id = ?,
            Categoria_Id = ?,
            Titulo = ?,
            Descripcion = ?,
            Requisitos = ?,
            Lugar_atencion = ?,
            Fecha_limite = ?,
            TargetAudience = ?,
            SpecificMatricula = ?
        WHERE ID = ?
    `;
    db.query(
        sql,
        [
            departamentoId,
            categoriaId,
            titulo,
            descripcion,
            requisitos,
            lugarAtencion,
            fechaLimite,
            targetAudience,
            specificMatricula,
            id
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al actualizar"
                });
            }
            res.json({
                mensaje: "Trámite actualizado"
            });
        }
    );
};

const eliminarTramite = (req, res) => {
    const { id } = req.params;
    db.query(
        "DELETE FROM estatusalumnotramite WHERE Tramite_Id = ?",
        [id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    mensaje: "Error al eliminar relaciones"
                });
            }
            db.query(
                "DELETE FROM tramites WHERE ID = ?",
                [id],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            mensaje: "Error al eliminar trámite"
                        });
                    }
                    res.json({
                        mensaje: "Trámite eliminado"
                    });
                }
            );
        }
    );

};
module.exports = {
    obtenerTramites,
    crearTramite,
    editarTramite,
    eliminarTramite
};