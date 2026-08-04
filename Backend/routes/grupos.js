const express = require("express");
const router = express.Router();

const {
    obtenerGrupos
} = require("../controllers/gruposController");

router.get("/", obtenerGrupos);

module.exports = router;