import sys
import mlflow

if len(sys.argv) != 3:
    print("Usage: python log-artifact.py <run_id> <file>")
    sys.exit(1)

run_id = sys.argv[1]
file_path = sys.argv[2]

mlflow.set_tracking_uri("http://127.0.0.1:5000")

with mlflow.start_run(
    run_id=run_id
):
    mlflow.log_artifact(
        file_path,
        artifact_path="model"
    )

print(f"Artifact uploaded: {file_path}")