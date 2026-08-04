const express = require("express");
const router = express.Router();

const {
    obtenerEncuestas,
    crearEncuesta
} = require("../controllers/encuestasController");

router.get("/", obtenerEncuestas);

router.post("/", crearEncuesta);

module.exports = router;