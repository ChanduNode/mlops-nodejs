export interface ModelData {
  weights: number[];
  bias: number;
}

export class LogisticRegression {

  private weights: number[];
  private bias: number;

  constructor(featureCount: number) {

    this.weights =
      new Array(featureCount).fill(0);

    this.bias = 0;
  }

  private sigmoid(
    value: number
  ): number {

    return 1 / (1 + Math.exp(-value));
  }

  predictProbability(
    features: number[]
  ): number {

    let result = this.bias;

    for (
      let i = 0;
      i < this.weights.length;
      i++
    ) {

      result +=
        this.weights[i] * features[i];
    }

    return this.sigmoid(result);
  }

  predict(
    features: number[]
  ): number {

    const probability =
      this.predictProbability(features);

    return probability >= 0.5 ? 1 : 0;
  }

  train(
    X: number[][],
    y: number[],
    epochs: number,
    learningRate: number
  ): void {

    for (
      let epoch = 0;
      epoch < epochs;
      epoch++
    ) {

      const weightGradients =
        new Array(this.weights.length).fill(0);

      let biasGradient = 0;

      for (
        let i = 0;
        i < X.length;
        i++
      ) {

        const prediction =
          this.predictProbability(X[i]);

        const error =
          prediction - y[i];

        for (
          let j = 0;
          j < this.weights.length;
          j++
        ) {

          weightGradients[j] +=
            error * X[i][j];
        }

        biasGradient += error;
      }

      for (
        let j = 0;
        j < this.weights.length;
        j++
      ) {

        this.weights[j] -=
          learningRate *
          weightGradients[j] /
          X.length;
      }

      this.bias -=
        learningRate *
        biasGradient /
        X.length;
    }
  }

  load(data: ModelData): void {
    this.weights = [...data.weights];
    this.bias = data.bias;
  }

  serialize(): ModelData {

    return {
      weights: this.weights,
      bias: this.bias
    };
  }
}