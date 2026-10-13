import "dotenv/config"; // must stay the first import so env vars exist before app.js reads them
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Fieldnote API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
