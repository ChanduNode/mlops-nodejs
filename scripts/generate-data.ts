import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "customers.csv");

fs.mkdirSync(dataDir, { recursive: true });

const rows: string[] = [
  "age,income,website_visits,purchase_count,label"
];

for (let i = 0; i < 1500; i++) {
  const age = Math.floor(Math.random() * 50) + 20;

  const income =
    Math.floor(Math.random() * 80000) + 20000;

  const websiteVisits =
    Math.floor(Math.random() * 20);

  const purchaseCount =
    Math.floor(Math.random() * 10);

  /*
   * Create a synthetic relationship.
   *
   * More income,
   * more visits,
   * more previous purchases
   * => higher chance of buying.
   */

  const score =
    -3 +
    age * 0.015 +
    income / 50000 +
    websiteVisits * 0.12 +
    purchaseCount * 0.45;

  const probability =
    1 / (1 + Math.exp(-score));

  const label =
    Math.random() < probability ? 1 : 0;

  rows.push(
    [
      age,
      income,
      websiteVisits,
      purchaseCount,
      label
    ].join(",")
  );
}

fs.writeFileSync(
  filePath,
  rows.join("\n"),
  "utf8"
);

console.log(
  `Dataset generated: ${filePath}`
);