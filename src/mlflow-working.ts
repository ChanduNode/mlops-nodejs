import axios from "axios";

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

export async function finishRun(
  runId: string
): Promise<void> {

  await axios.post(
    `${MLFLOW_URL}/api/2.0/mlflow/runs/update`,
    {
      run_id: runId,
      status: "FINISHED",
      end_time: Date.now()
    }
  );
}