const express = require("express");
const router = express.Router();

const {
    obtenerDepartamentos
} = require("../controllers/departamentosController");

router.get("/", obtenerDepartamentos);

module.exports = router;