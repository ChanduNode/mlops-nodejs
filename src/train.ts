import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import {
  loadDataset
} from "./data.js";

import {
  LogisticRegression
} from "./model.js";


import {
  createRun,
  logParameter,
  logMetric,
 logTag, logArtifact,
  finishRun
} from "./mlflow.js";

import {
  execSync
} from "node:child_process";

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

const EXPERIMENT_ID =
  process.env.MLFLOW_EXPERIMENT_ID ?? "0";


  function getGitCommit(): string {

  try {

    return execSync(
      "git rev-parse HEAD"
    )
      .toString()
      .trim();

  } catch {

    return "unknown";
  }
}


function getDvcDatasetHash(): string {

  const dvcFile =
    path.join(
      process.cwd(),
      "data",
      "customers.csv.dvc"
    );

  try {

    const content =
      fs.readFileSync(
        dvcFile,
        "utf8"
      );

    const match =
      content.match(
        /md5:\s*([a-f0-9]+)/
      );

    return match?.[1] ?? "unknown";

  } catch {

    return "unknown";
  }
}

async function main() {

  console.log("\n==============================");
  console.log("       MLOps Training");
  console.log("==============================\n");

  console.log("Loading dataset...");

  const dataset =
    loadDataset(DATA_PATH);

  const split =
    Math.floor(
      dataset.X.length * 0.8
    );

  const trainX =
    dataset.X.slice(0, split);

  const trainY =
    dataset.y.slice(0, split);

  const testX =
    dataset.X.slice(split);

  const testY =
    dataset.y.slice(split);

  console.log(
    `Training samples: ${trainX.length}`
  );

  console.log(
    `Testing samples: ${testX.length}`
  );

  /*
   * These are the parameters
   * we want MLflow to track.
   */

  const epochs =
    Number(
      process.env.EPOCHS ?? 1000
    );

  const learningRate =
    Number(
      process.env.LEARNING_RATE ?? 0.1
    );

  console.log(
    `Epochs: ${epochs}`
  );

  console.log(
    `Learning rate: ${learningRate}`
  );

  /*
   * Create MLflow run.
   */

  console.log(
    "\nCreating MLflow run..."
  );

  const runId =
    await createRun(
      EXPERIMENT_ID
    );


    const gitCommit =
  getGitCommit();

const dvcDatasetHash =
  getDvcDatasetHash();

console.log(
  `Git commit: ${gitCommit}`
);

console.log(
  `DVC dataset hash: ${dvcDatasetHash}`
);


await logTag(
  runId,
  "git_commit",
  gitCommit
);

await logTag(
  runId,
  "dvc_dataset_hash",
  dvcDatasetHash
);

  console.log(
    `MLflow Run ID: ${runId}`
  );

  /*
   * Log parameters.
   */

  await logParameter(
    runId,
    "epochs",
    epochs.toString()
  );

  await logParameter(
    runId,
    "learning_rate",
    learningRate.toString()
  );

  await logParameter(
    runId,
    "dataset_size",
    dataset.X.length.toString()
  );

  /*
   * Train.
   */

  console.log(
    "\nTraining model..."
  );

  const model =
    new LogisticRegression(4);

  model.train(
    trainX,
    trainY,
    epochs,
    learningRate
  );

  /*
   * Evaluate.
   */

  let correct = 0;

  for (
    let i = 0;
    i < testX.length;
    i++
  ) {

    const prediction =
      model.predict(testX[i]);

    if (
      prediction === testY[i]
    ) {
      correct++;
    }
  }

  const accuracy =
    correct / testX.length;

  console.log(
    `Accuracy: ${accuracy.toFixed(4)}`
  );

  /*
   * Log metric.
   */

  await logMetric(
    runId,
    "accuracy",
    accuracy
  );

  /*
   * Save model.
   */

 fs.mkdirSync(
  path.dirname(MODEL_PATH),
  {
    recursive: true
  }
);

fs.writeFileSync(
  MODEL_PATH,
  JSON.stringify(
    model.serialize(),
    null,
    2
  ),
  "utf8"
);

// await logArtifact(
//   runId,
//   EXPERIMENT_ID,
//   MODEL_PATH
//  );

// logs of artifact with python script 

console.log(
  "\nUploading model artifact..."
);
await logArtifact(runId, EXPERIMENT_ID, MODEL_PATH);
// execSync(
//   `python3 scripts/log-artifact.py "${runId}" "${MODEL_PATH}"`,
//   {
//     stdio: "inherit"
//   }
// );

console.log(
  "Model artifact uploaded."
);



  /*
   * Finish MLflow run.
   */

  await finishRun(runId);

  console.log(
    `\nModel saved to: ${MODEL_PATH}`
  );

  console.log(
    `MLflow run finished: ${runId}`
  );

  console.log(
    "\nTraining completed successfully."
  );
}

main().catch(error => {

  console.error(
    "\nTraining failed:"
  );

  if (error.response) {

    console.error(
      "MLflow response:",
      error.response.data
    );

  } else {

    console.error(
      error.message
    );
  }

  process.exit(1);
});

