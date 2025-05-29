// Note: cooldown measured in MS. 1000 MS = 1 second.

import { FRESH_SAVE, TEST_SAVE } from "./data/fresh-save.data.js";
import { STORAGE_UPGRADES } from "./data/storage.data.js";
import { GENERATOR_IDS, GENERATORS } from "./data/generators.data.js";
import { ANIMATIONS } from "./data/animations.data.js";
import { POINT_CLASSES, POINT_TYPES, POINT_PROPS } from "./data/points.data.js";

import Save from "./modules/save.js";
import PointCollection from "./modules/point.collection.js";
import Generator from "./modules/generator.js";

import SaveProxy from "./classes/proxy.js";
import Render from "./classes/render.js";
import Animate from "./classes/animate.js";
import Utils from "./classes/utils.js";


let lastUpdate = 0;
const updateInterval = 1600;

const save = new Save();
const render = new Render();
const animate = new Animate();
const utils = new Utils();

const generator = new Generator();

const saveProxy = new SaveProxy(FRESH_SAVE);
// const saveProxy = new SaveProxy(TEST_SAVE);
let proxySave = saveProxy.proxy;


const animations = ANIMATIONS;
const pointTypes = POINT_TYPES;
const pointProps = POINT_PROPS;

// #region Elements

// Settings
const saveButton = document.getElementById("saveGame");
const resetButton = document.getElementById("resetGame");

// Layout
const central = document.getElementById("central");

const storage = document.getElementById("storage");
const dump = document.getElementById("dump");
const storageUpgrade = document.getElementById("storage-upgrade");
const pointsContainer = document.getElementById("points");

// Generators
const clickGenerator = document.getElementById(GENERATOR_IDS.CLICK);
let cooldownGenerator = null;

// #endregion Elements

// #region Event Listeners

// Save
saveButton.addEventListener("click", () => save.saveGame(proxySave));
resetButton.addEventListener("click", () => save.resetGame());
dump.addEventListener("click", () => dumpAllPoints());

// Generators
// clickGenerator.addEventListener("click", () =>
//   generatorOnAction(GENERATOR_IDS.CLICK)
// );

// #endregion Event Listeners

// #region Points

function addPoints(generatorName) {
  // Guards
  if (!generator.getGeneratorData(generatorName)) return;

  let pointsToConsume = new PointCollection(generator.whatConsumes(generatorName));
  let pointsToConsumeCollection = pointsToConsume.collection;

  if (!hasEnoughPoints(pointsToConsumeCollection)) return;

  let pointsToGenerate = new PointCollection(generator.whatGenerates(generatorName));
  if (doesOvercap(pointsToGenerate.total, pointsToConsumeCollection)) return;

  // Consume
  if (pointsToConsume.total) {
    consumePoints(pointsToConsumeCollection);
  }

  // Generate
  let collection = pointsToGenerate.collection;
  for (const type of pointProps) {
    proxySave.points[type] += collection[type];
    proxySave.points_order.push(...new Array(collection[type]).fill(type));
  }
}

/**
 * @param {PointCollection.collection} pointsToMeet
 * @returns {Boolean}
 */
export function hasEnoughPoints(pointsToMeet) {
  let hasEnoughPoints = true;
  if (pointsToMeet) {
    for (const [key, value] of Object.entries(pointsToMeet)) {
      if (value > proxySave.points[key]) hasEnoughPoints = false;
    }
  }
  return hasEnoughPoints;
}

/**
 * @param {Number} totalToGenerate
 * @param {PointCollection.collection} pointsToConsume
 * @returns {Boolean}
 */
function doesOvercap(totalToGenerate, pointsToConsume) {
  let doesOvercap = false;
  let pointsSum = 0;
  for (const type of pointProps) {
    pointsSum += proxySave.points[type] - pointsToConsume[type];
  }
  if (pointsSum + totalToGenerate > proxySave.maxStorage) {
    animate.timedOut(pointsContainer, animations.tilt);
    doesOvercap = true;
  }
  return doesOvercap;
}

/**
 * @param {PointCollection.collection} pointsToConsume
 */
function consumePoints(pointsToConsume) {
  if (!pointsToConsume) return;

  for (const [key, valueToConsume] of Object.entries(pointsToConsume)) {
    proxySave.points[key] -= valueToConsume;

    let pointsOrderItemsToRemove = valueToConsume;
    for (
      let i = proxySave.points_order.length - 1;
      i >= 0 && pointsOrderItemsToRemove > 0;
      i--
    ) {
      if (proxySave.points_order[i] === key) {
        proxySave.points_order.splice(i, 1);
        pointsOrderItemsToRemove--;
      }
    }
  }
}

function dumpAllPoints() {
  for (const type of pointProps) {
    proxySave.points[type] = 0;
  }
  proxySave.points_order = [];
}

// #endregion Points

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
  return;

  GENERATORS.forEach((generator) => {
    if (!generator.unlockRequires) return;

    let currentGenerator = proxySave.generators.find(
      (value) => value.name === generator.name
    );
    if (!currentGenerator) return;

    const generatorElement = getGeneratorElement(currentGenerator.name);

    if (currentGenerator.built) {
      showGeneratorElement(generatorElement);
      registerGeneratorAction(generatorElement, currentGenerator.name);
      return;
    }

    if (
      currentGenerator.progress ||
      (generator.unlockRequires.build &&
        hasEnoughPoints(generator.unlockRequires.build))
    ) {
      if (!currentGenerator.canBuild) currentGenerator.canBuild = true;

      showBuild(generatorElement, generator);
      registerGeneratorAction(generatorElement, currentGenerator.name);
      return;
    }

    if (
      generator.unlockRequires.hint &&
      hasEnoughPoints(generator.unlockRequires.hint)
    ) {
      if (!currentGenerator.hinted) currentGenerator.hinted = true;

      showHint(generatorElement);
      registerGeneratorAction(generatorElement, currentGenerator.name);
    }
  });
}

function checkGeneratorUnlocks() {

  checkLockedGenerators([...generator.lockedGens]);
  checkHintedGenerators([...generator.hintedGens]);
  checkCanBeBuiltGenerators([...generator.canBuildGens]);
  checkBuiltGenerators([...generator.builtGens]);
}

/**
 * @param {string[]} generators
 */
function checkLockedGenerators(generators) {

  generators.forEach(generatorName => {
    let proxyGenerator = validateGeneratorInProxySave(generatorName);
    let dataGenerator = getGeneratorData(generatorName);
    if (!proxyGenerator) return;

    if (hasEnoughPoints(dataGenerator.unlockRequires.hint)) {
      if (!proxyGenerator.hinted) proxyGenerator.hinted = true;
      generator.canBeHinted(generatorName);
    } else {
      if (proxyGenerator.hinted) proxyGenerator.hinted = false;
    }
  });
}

/**
 * @param {string[]} generators
 */
function checkHintedGenerators(generators) {

  generators.forEach(generatorName => {
    let proxyGenerator = validateGeneratorInProxySave(generatorName);
    let dataGenerator = getGeneratorData(generatorName);
    if (!proxyGenerator) return;

    if (hasEnoughPoints(dataGenerator.unlockRequires.build)) {
      proxyGenerator.canBuild = true;
      generator.canBeBuilt(generatorName);
    } 
    else {
      const generatorElement = getGeneratorElement(generatorName);
      showHint(generatorElement);
      registerGeneratorAction(generatorElement, generatorName);
    }
  });
}

/**
 * @param {string[]} generators
 */
function checkCanBeBuiltGenerators(generators) {

  generators.forEach(generatorName => {
    let proxyGenerator = validateGeneratorInProxySave(generatorName);
    let dataGenerator = getGeneratorData(generatorName);
    if (!proxyGenerator) return;

    const generatorElement = getGeneratorElement(generatorName);
    showBuild(generatorElement, dataGenerator.buildRequires.step);
    registerGeneratorAction(generatorElement, generatorName);
  });
}

/**
 * @param {string[]} generators
 */
function checkBuiltGenerators(generators) {

  generators.forEach(generatorName => {
    let proxyGenerator = validateGeneratorInProxySave(generatorName);
    if (!proxyGenerator) return;

    const generatorElement = getGeneratorElement(generatorName);
    showGeneratorElement(generatorElement);
    registerGeneratorAction(generatorElement, generatorName);
  });
}

/**
 * @param {string} generatorName 
 * @returns {Object | null}
 */
function validateGeneratorInProxySave(generatorName) {
  return proxySave.generators.find(generator=> generator.name === generatorName);
}

/**
 * @param {string} generatorName 
 * @returns {Object | null}
 */
function getGeneratorData(generatorName) {
  return generator.getGeneratorData(generatorName);
}


/**
 * @param {string} generatorName 
 * @returns {HTMLElement}
 */
function getGeneratorElement(generatorName) {
  return document.getElementById(generatorName) ?? render.renderGenerator(generatorName);
}

/**
 * @param {HTMLElement} generatorElement 
 */
function showHint(generatorElement) {
  if (!generatorElement.classList.contains("hint"))
    generatorElement.classList.add("hint");

  showGeneratorElement(generatorElement);
}

function showBuild(generatorElement, generatorData) {
  if (!generatorElement.classList.contains("blank"))
    generatorElement.classList.add("blank");
  if (generatorElement.classList.contains("hint"))
    generatorElement.classList.remove("hint");

  showGeneratorElement(generatorElement);

  showCostPreview(generatorElement, generatorData);
}

/**
 * 
 * @param {HTMLElement} generatorElement 
 * @param {Object} buildCosts 
 * @returns 
 */
function showCostPreview(generatorElement, buildCosts) {
  if (render.hasCostPreview(generatorElement)) return;

  const costPreviewElement = render.renderCostPreview();
  for (let pointType in buildCosts) {
    costPreviewElement.appendChild(render.renderPoint(pointType));
  }
  generatorElement.appendChild(costPreviewElement);
}

/**
 * 
 * @param {HTMLElement} generatorElement 
 * @param {string} generatorName 
 */
function registerGeneratorAction(generatorElement, generatorName) {
  if (!generatorElement || !generatorName) return;
  
  utils.addEventListenerWithFlag(
    generatorElement,
    "click",
    generatorOnAction,
    generatorName
  );
}

/**
 * @param {HTMLElement} generatorElement 
 */
function showGeneratorElement(generatorElement) {
  if (central.contains(generatorElement)) return;

  central.appendChild(generatorElement);
  animate.widthIn(generatorElement);
}

// #endregion Unlocks

// #region Build

function buildGenerator(generatorName) {
  const dataGenerator = GENERATORS.find(
    (generator) => generator.name === generatorName
  );

  if (!dataGenerator) return;

  const currentGenerator = proxySave.generators.find(
    (value) => value.name === dataGenerator.name
  );

  if (!currentGenerator) return;

  if (currentGenerator.built || !currentGenerator.canBuild) return;

  const buildStep = dataGenerator.buildRequires.step;

  if (!hasEnoughPoints(buildStep)) return;

  consumePoints(buildStep);

  currentGenerator.progress = currentGenerator.progress ?? 0;

  currentGenerator.progress += 1;

  if (currentGenerator.progress >= dataGenerator.buildRequires.totalSteps) {
    currentGenerator.built = true;
    generator.isBuilt(generatorName);
    checkGeneratorBuilt(generatorName);
  }
}

function checkGeneratorBuilt(generatorName) {
  let generatorElement = getGeneratorElement(generatorName);
  showGeneratorElement(generatorElement);

  if (generatorElement.classList.contains("blank"))
    generatorElement.classList.remove("blank");

  render.removeCostPreview(generatorElement);
}

// #endregion Build

// #region Generator

function generatorOnAction(generatorName) {
  const generator = proxySave.generators.find(
    (generator) => generator.name == generatorName
  );
  if (!generator) return;

  if (generator.built) {
    addPoints(generatorName);
    return;
  }

  if (generator.canBuild) {
    buildGenerator(generatorName);
    return;
  }

  if (generator.hinted) {
    console.log("You see a new thing...");
  }
}

// #endregion Generator

// #region Render

/**
 * @param {PointCollection} points
 * @param {string[]} orderedPoints
 */
function setStoragePoints(points, orderedPoints) {
  // Guards
  for (let [key, value] of Object.entries(points.collection)) {
    if (value === null || value === undefined) return;
    if (!pointProps.includes(key)) return;
  }
  if (!Array.isArray(orderedPoints) || !orderedPoints)
    return;
  if (!pointsContainer) return;
  // -Guards

  // Sanitize Points
  // sanitizePoints(orderedPoints);
  // -Sanitize Points

  // Render points as necessary
  let currentBasicPoints = 0;
  let currentSolidPoints = 0;
  let currentEnergyPoints = 0;

  Array.from(pointsContainer.children).forEach((child) => {
    if (child.classList.contains("solid")) currentSolidPoints++;
    else if (child.classList.contains("energy")) currentEnergyPoints++;
    else currentBasicPoints++;
  });

  removePoints(currentBasicPoints, points.collection.point, POINT_TYPES.point);
  removePoints(currentSolidPoints, points.collection.solid_point, POINT_TYPES.solid_point);
  removePoints(currentEnergyPoints, points.collection.energy_point, POINT_TYPES.energy_point);

  renderPoints(currentBasicPoints, points.collection.point, POINT_TYPES.point);
  renderPoints(currentSolidPoints, points.collection.solid_point, POINT_TYPES.solid_point);
  renderPoints(currentEnergyPoints, points.collection.energy_point, POINT_TYPES.energy_point);
}

/**
 * @param {string []} orderedPoints
 */
function sanitizePoints(orderedPoints) {

  if (!orderedPoints || !orderedPoints.length) return; 

  const pointsContainerChildrenArray = Array.from(pointsContainer.children);
  if (!pointsContainerChildrenArray || !pointsContainerChildrenArray.length) return;

  if (orderedPoints.length > proxySave.maxStorage)
    orderedPoints.length = proxySave.maxStorage;

  pointsContainerChildrenArray.forEach((child, index) => {

    // Determine the correct class for the point type
    let expectedClasses = POINT_CLASSES[orderedPoints[index]];

    if (!expectedClasses || !expectedClasses.length) return;

    const newChild = document.createElement("div");
    expectedClasses.forEach(expectedClass => newChild.classList.add(expectedClass));
    // Replace the child in pointsContainer
    pointsContainer.replaceChild(newChild, child);
  });
}


function renderPoints(currentPoints, pointsToMatch, pointType){
  if (currentPoints >= pointsToMatch) return;

  while (currentPoints < pointsToMatch) {
      let pointToAppend = render.renderPoint(pointType, "no-width");
      pointsContainer.appendChild(pointToAppend);
      animate.widthIn(pointToAppend);
      currentPoints++;
  }
}

async function removePoints(currentPoints, pointsToMatch, pointType) {
  if (currentPoints <= pointsToMatch) return;

  while (currentPoints > pointsToMatch) {
      await render.removePoint(pointsContainer, pointType);
      currentPoints--;
  }
}

// #endregion Render

// #region Global

// SetUp

function startGame() {
  let loadedSave = save.loadSave();
  setProxySave(loadedSave);
  setGeneratorsFromSave(proxySave.generators);

  saveProxy.subscribe((updatedSave) => {
    save.saveGame(updatedSave);
    gameLoop();
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  let points = new PointCollection(proxySave.points);

  setStoragePoints(points, proxySave.points_order);
  checkUnlocks();

  // requestAnimationFrame(gameLoop);

  // if (timestamp - lastUpdate >= updateInterval) {
  //     setStoragePoints(proxySave.points, proxySave.solid_points, proxySave.energy_points);
  //     checkUnlocks();
  //     lastUpdate = timestamp;
  // }
  // requestAnimationFrame(gameLoop);
}

function setProxySave(save) {
  if(typeof save !== 'object') return;
  Object.assign(proxySave, save);
}

function setGeneratorsFromSave(generators) {
  generator.newGenerator(generators);
}

startGame();

// #endregion Global
