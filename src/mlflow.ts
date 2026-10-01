import axios from "axios";
import fs from "node:fs";

const MLFLOW_URL =
  process.env.MLFLOW_URL ??
  "http://localhost:5000";

export async function createRun(
  experimentId: string
): Promise<string> {

  const response = await axios.post(
    `${MLFLOW_URL}/api/2.0/mlflow/runs/create`,
    {
      experiment_id: experimentId,
      start_time: Date.now()
    }
  );

  return response.data.run.info.run_id;
}

export async function logParameter(
  runId: string,
  key: string,
  value: string
): Promise<void> {

  await axios.post(
    `${MLFLOW_URL}/api/2.0/mlflow/runs/log-parameter`,
    {
      run_id: runId,
      key,
      value
    }
  );
}

export async function logMetric(
  runId: string,
  key: string,
  value: number
): Promise<void> {

  await axios.post(
    `${MLFLOW_URL}/api/2.0/mlflow/runs/log-metric`,
    {
      run_id: runId,
      key,
      value,
      timestamp: Date.now(),
      step: 0
    }
  );
}

export async function logTag(
  runId: string,
  key: string,
  value: string
): Promise<void> {

  await axios.post(
    `${MLFLOW_URL}/api/2.0/mlflow/runs/set-tag`,
    {
      run_id: runId,
      key,
      value
    }
  );
}

// export async function finishRun(
//   runId: string
// ): Promise<void> {

//   await axios.post(
//     `${MLFLOW_URL}/api/2.0/mlflow/runs/update`,
//     {
//       run_id: runId,
//       status: "FINISHED",
//       end_time: Date.now()
//     }
//   );
// }

// export async function finishRun(
//   runId: string
// ): Promise<void> {
//   try {
//     await axios.post(
//       `${MLFLOW_URL}/api/2.0/mlflow/runs/update`,
//       {
//         run_id: runId,
//         status: "FINISHED",
//         end_time: Date.now()
//       },
//       {
//         timeout: 10000
//       }
//     );

//     console.log("MLflow run finished.");
//   } catch (error) {
//     console.error("Failed to finish MLflow run.");

//     if (axios.isAxiosError(error)) {
//       console.error("Status:", error.response?.status);
//       console.error("Response:", error.response?.data);
//       console.error("Message:", error.message);
//     }

//     throw error;
//   }
// }


export async function finishRun(
  runId: string
): Promise<void> {
  try {
    await axios.post(
      `${MLFLOW_URL}/api/2.0/mlflow/runs/update`,
      {
        run_id: runId,
        status: "FINISHED",
        end_time: Date.now()
      },
      {
        timeout: 10000
      }
    );

    console.log("MLflow run finished.");
  } catch (error) {
    console.error("Failed to finish MLflow run.");

    if (axios.isAxiosError(error)) {
      console.error("Code:", error.code);
      console.error("Message:", error.message);
      console.error("URL:", error.config?.url);
    } else {
      console.error(error);
    }

    // Don't make an otherwise successful training run fail
    // just because the final MLflow update failed.
  }
}

export async function logArtifact(
  runId: string,
  experimentId: string,
  filePath: string
): Promise<void> {
  const file = fs.createReadStream(filePath);

  const artifactPath =
    `${experimentId}/${runId}/artifacts/${filePath.split(/[\\/]/).pop()}`;

  await axios.put(
    `${MLFLOW_URL}/api/2.0/mlflow-artifacts/artifacts/${artifactPath}`,
    file,
    {
      headers: {
        "Content-Type": "application/octet-stream"
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  );
}