import BaseGenerator from "../generator.template";

export default class ClickGenerator extends BaseGenerator {
  afterGenerate(generated) {
    console.log(`[Click] Generated ${generated.total} points`);
  }
}