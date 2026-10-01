import "dotenv/config";

import express from "express";
import fs from "node:fs";
import path from "node:path";

import {
  LogisticRegression,
  ModelData
} from "./model.js";


const app = express();

app.use(express.json());


const PORT =
  Number(
    process.env.PORT ?? 8080
  );


const MODEL_PATH =
  path.join(
    process.cwd(),
    "models",
    "model.json"
  );


/*
 * Load model once when
 * the server starts.
 */

if (!fs.existsSync(MODEL_PATH)) {

  throw new Error(
    `Model not found: ${MODEL_PATH}`
  );
}


const modelData =
  JSON.parse(
    fs.readFileSync(
      MODEL_PATH,
      "utf8"
    )
  ) as ModelData;


const model =
  new LogisticRegression(4);

model.load(modelData);


console.log(
  `Model loaded from: ${MODEL_PATH}`
);


/*
 * Health endpoint.
 */

app.get(
  "/health",
  (_req, res) => {

    res.json({
      status: "ok",
      model: "logistic-regression"
    });
  }
);


/*
 * Prediction endpoint.
 */

app.post(
  "/predict",
  (req, res) => {

    try {

      const {
        age,
        income,
        websiteVisits,
        purchaseCount
      } = req.body;


      /*
       * Validate input.
       */

      if (
        typeof age !== "number" ||
        typeof income !== "number" ||
        typeof websiteVisits !== "number" ||
        typeof purchaseCount !== "number"
      ) {

        return res.status(400).json({
          error:
            "age, income, websiteVisits and purchaseCount must be numbers"
        });
      }


      /*
       * Apply EXACTLY the same
       * normalization used during training.
       */

      const features = [

        age / 100,

        income / 100000,

        websiteVisits / 20,

        purchaseCount / 10

      ];


      /*
       * Generate prediction.
       */

      const probability =
        model.predictProbability(
          features
        );


      const prediction =
        probability >= 0.5
          ? 1
          : 0;


      return res.json({

        prediction,

        probability:

          Number(
            probability.toFixed(4)
          )

      });

    } catch (error) {

      console.error(
        "Prediction error:",
        error
      );

      return res.status(500).json({
        error: "Prediction failed"
      });
    }
  }
);


/*
 * Start server.
 */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Model server running on port ${PORT}`
    );

    console.log(
      `Health: http://localhost:${PORT}/health`
    );

    console.log(
      `Predict: POST http://localhost:${PORT}/predict`
    );
  }
);