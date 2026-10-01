import fs from 'node:fs';
import { LogisticRegression, ModelData } from './model.js';
export function loadModel(filePath:string):LogisticRegression { const data=JSON.parse(fs.readFileSync(filePath,'utf8')) as ModelData; const model=new LogisticRegression(data.weights.length); model.load(data); return model; }
