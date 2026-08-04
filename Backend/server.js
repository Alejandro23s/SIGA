require("dotenv").config();

const tramitesRoutes = require("./routes/tramites");
const estatusRoutes = require("./routes/estatus");
const categoriasRoutes = require("./routes/categorias");
const departamentosRoutes = require("./routes/departamentos");
const gruposRoutes = require("./routes/grupos");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const alumnosRoutes = require("./routes/alumnos");

require("./db");
app.use("/alumnos", alumnosRoutes);
app.use("/tramites", tramitesRoutes);
app.use("/estatus", estatusRoutes);
console.log("Ruta tipos-tramite cargada");
app.use("/categorias", categoriasRoutes);
app.use("/departamentos", departamentosRoutes);
app.use("/grupos", gruposRoutes);


app.get("/", (req, res) => {
    res.send("Servidor SIGA funcionando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});