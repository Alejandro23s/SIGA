const express = require("express");
const router = express.Router();

const {
    completarTramite,
    obtenerTramitesCompletados,
    reabrirTramite,
    obtenerReporteTramite
} = require("../controllers/estatusController");

router.get("/reporte/:tramiteId", obtenerReporteTramite);

router.get("/:alumnoId", obtenerTramitesCompletados);

router.post("/", completarTramite);

router.delete("/:alumnoId/:tramiteId", reabrirTramite);



module.exports = router;