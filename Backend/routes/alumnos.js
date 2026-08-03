const express = require("express");

const router = express.Router();

const {
    obtenerAlumnos,
    obtenerAlumnoPorMatricula
} = require("../controllers/alumnosController");

router.get("/", obtenerAlumnos);

router.get("/:matricula", obtenerAlumnoPorMatricula);

module.exports = router;