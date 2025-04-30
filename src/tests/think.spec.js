// import { hasEnoughPoints } from "../engine/think.js";
import Utils from "../engine/classes/utils.js";

describe("milliseconds formated", () => {

  let utils = new Utils();

  it("should return formated value", () => {
    
    expect(utils.getNumberFromMSValue('300ms')).toBe(300);
    expect(() => utils.getNumberFromMSValue(300)).toThrowError("Invalid value: 300. Expected a string with 'ms' suffix.");
  })
})

// describe("hasEnoughPoints", () => {
//   it("should return true if there are enough points", () => {
//     const pointsToMeet = { point: 5, solid_point: 3 };
//     const proxySave = {
//       points: { point: 10, solid_point: 5 },
//     };
//     const ANIMATIONS = animationMock;
//     expect(hasEnoughPoints(pointsToMeet)).toBe(true);
//   });

//   it("should return false if there are not enough points", () => {
//     const pointsToMeet = { point: 5, solid_point: 3 };
//     const proxySave = {
//       points: { point: 2, solid_point: 1 },
//     };
//     const ANIMATIONS = animationMock;
//     expect(hasEnoughPoints(pointsToMeet)).toBe(false);
//   });
// });