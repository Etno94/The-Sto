import BaseGenerator from "../generator.template";

export default class CDGenerator extends BaseGenerator {
  afterGenerate(generated) {
    console.log(`[CD] Generated ${generated.total} points`);
  }
}