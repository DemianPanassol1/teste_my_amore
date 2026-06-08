const createApp = require("./app");
const env = require("./config/env");

createApp()
  .then((app) => {
    app.listen(env.port, () => {
      console.log(`API rodando em http://localhost:${env.port}`);
      console.log(`Swagger em http://localhost:${env.port}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar a API:", error);
    process.exit(1);
  });
