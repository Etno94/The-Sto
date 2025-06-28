import BaseGenerator from "../generator.template";

export default class PulseGenerator extends BaseGenerator {
  afterGenerate(generated) {
    console.log(`[Pulse] Generated ${generated.total} points`);
  }
}