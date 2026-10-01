import fs from "node:fs";

export interface Dataset {
  X: number[][];
  y: number[];
}

export function loadDataset(
  filePath: string
): Dataset {

  const content =
    fs.readFileSync(filePath, "utf8");

  const lines =
    content.trim().split(/\r?\n/);

  // Remove header
  lines.shift();

  const X: number[][] = [];
  const y: number[] = [];

  for (const line of lines) {

    const values =
      line.split(",").map(Number);

    const [
      age,
      income,
      websiteVisits,
      purchaseCount,
      label
    ] = values;

    /*
     * Normalize features.
     *
     * This makes gradient descent
     * easier to train.
     */

    X.push([
      age / 100,
      income / 100000,
      websiteVisits / 20,
      purchaseCount / 10
    ]);

    y.push(label);
  }

  return {
    X,
    y
  };
}