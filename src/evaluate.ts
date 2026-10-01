import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import {
  loadDataset
} from "./data.js";

import {
  LogisticRegression,
  ModelData
} from "./model.js";


const DATA_PATH =
  path.join(
    process.cwd(),
    "data",
    "customers.csv"
  );

const MODEL_PATH =
  path.join(
    process.cwd(),
    "models",
    "model.json"
  );


function calculateMetrics(
  actual: number[],
  predicted: number[]
) {

  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (
    let i = 0;
    i < actual.length;
    i++
  ) {

    if (
      actual[i] === 1 &&
      predicted[i] === 1
    ) {
      tp++;
    }

    else if (
      actual[i] === 0 &&
      predicted[i] === 0
    ) {
      tn++;
    }

    else if (
      actual[i] === 0 &&
      predicted[i] === 1
    ) {
      fp++;
    }

    else if (
      actual[i] === 1 &&
      predicted[i] === 0
    ) {
      fn++;
    }
  }

  const accuracy =
    (tp + tn) /
    (tp + tn + fp + fn);

  const precision =
    tp + fp === 0
      ? 0
      : tp / (tp + fp);

  const recall =
    tp + fn === 0
      ? 0
      : tp / (tp + fn);

  const f1 =
    precision + recall === 0
      ? 0
      : 2 *
        (precision * recall) /
        (precision + recall);

  return {
    accuracy,
    precision,
    recall,
    f1,
    tp,
    tn,
    fp,
    fn
  };
}


async function main() {

  console.log("\n==============================");
  console.log("       Model Evaluation");
  console.log("==============================\n");


  /*
   * Check dataset.
   */

  console.log("Loading dataset...");

  if (!fs.existsSync(DATA_PATH)) {

    throw new Error(
      `Dataset not found: ${DATA_PATH}`
    );
  }

  const dataset =
    loadDataset(DATA_PATH);


  /*
   * Use the SAME 80/20 split
   * as train.ts.
   */

  const split =
    Math.floor(
      dataset.X.length * 0.8
    );

  const testX =
    dataset.X.slice(split);

  const testY =
    dataset.y.slice(split);


  console.log(
    `Total samples: ${dataset.X.length}`
  );

  console.log(
    `Evaluation samples: ${testX.length}`
  );


  /*
   * Check model.
   */

  console.log(
    "\nLoading trained model..."
  );

  if (!fs.existsSync(MODEL_PATH)) {

    throw new Error(
      `Model not found: ${MODEL_PATH}. Run npm run train first.`
    );
  }


  const modelData =
    JSON.parse(
      fs.readFileSync(
        MODEL_PATH,
        "utf8"
      )
    ) as ModelData;


  /*
   * Reconstruct trained model.
   */

  const model =
    new LogisticRegression(4);

  model.load(modelData);


  /*
   * Generate predictions.
   */

  console.log(
    "Generating predictions..."
  );

  const predictions: number[] = [];

  for (
    const features of testX
  ) {

    predictions.push(
      model.predict(features)
    );
  }


  /*
   * Calculate evaluation metrics.
   */

  const metrics =
    calculateMetrics(
      testY,
      predictions
    );


  console.log(
    "\n=============================="
  );

  console.log(
    "       Evaluation Results"
  );

  console.log(
    "==============================\n"
  );

  console.log(
    `Accuracy : ${metrics.accuracy.toFixed(4)}`
  );

  console.log(
    `Precision: ${metrics.precision.toFixed(4)}`
  );

  console.log(
    `Recall   : ${metrics.recall.toFixed(4)}`
  );

  console.log(
    `F1 Score : ${metrics.f1.toFixed(4)}`
  );


  /*
   * Confusion matrix.
   */

  console.log(
    "\nConfusion Matrix:"
  );

  console.log(
    `True Positive : ${metrics.tp}`
  );

  console.log(
    `True Negative : ${metrics.tn}`
  );

  console.log(
    `False Positive: ${metrics.fp}`
  );

  console.log(
    `False Negative: ${metrics.fn}`
  );


  /*
   * Save evaluation results.
   */

  const evaluationPath =
    path.join(
      process.cwd(),
      "models",
      "evaluation.json"
    );


  fs.writeFileSync(
    evaluationPath,
    JSON.stringify(
      {
        datasetSize: dataset.X.length,
        evaluationSamples: testX.length,
        metrics
      },
      null,
      2
    ),
    "utf8"
  );


  console.log(
    `\nEvaluation saved to: ${evaluationPath}`
  );

  console.log(
    "\nEvaluation completed successfully."
  );
}


main().catch(error => {

  console.error(
    "\nEvaluation failed:"
  );

  console.error(
    error.message
  );

  process.exit(1);
});