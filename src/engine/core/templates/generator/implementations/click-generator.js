import BaseGenerator from "../generator.template.js";

export default class ClickGenerator extends BaseGenerator {
  emitStatus(generated) {
    super.emitStatus(generated);
  }
  afterGenerate(generated) {
    console.log(`[Click] Generated ${generated.total} points`);
  }
}