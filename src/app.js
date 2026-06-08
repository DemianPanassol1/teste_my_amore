const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { initializeDatabase } = require("./database/connection");

const routes = require("./routes");
const swaggerDocument = require("./docs/openapi");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

async function createApp() {
  await initializeDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        message: "Simple Social API",
        docs: "/api-docs",
      },
    });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
