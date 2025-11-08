import app from "../server.js";
import serverless from "serverless-http";

export const config = {
  api: {
    bodyParser: false, // deja que Express maneje el body
  },
};

export default serverless(app);
