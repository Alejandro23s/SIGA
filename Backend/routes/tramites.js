const express = require("express");
const router = express.Router();

const {
    obtenerTramites,
    crearTramite,
    editarTramite,
    eliminarTramite
} = require("../controllers/tramitesController");

router.get("/", obtenerTramites);

router.post("/", crearTramite);

router.put("/:id", editarTramite);

router.delete("/:id", eliminarTramite);

module.exports = router;