import dotenv from "dotenv";
import { pool } from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

console.log("Initializing the server");
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3045;

// pool.connect((err, client, release) => {
//     if (err) {
//         console.error('Error acquiring client', err.stack);
//         return;
//     }
//     console.log('Connected to the database');

// });
app.listen(port, host, () => {
    console.log(`Sever is live at port: ${host + ":" + port}`);
});
