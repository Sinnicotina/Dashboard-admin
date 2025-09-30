import dotenv from "dotenv";
import app from "./api/index.js";
import bcrypt from "bcrypt";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Escuchando por el puerto ${PORT}`);
})

