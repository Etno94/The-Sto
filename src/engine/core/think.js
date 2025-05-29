import { FRESH_SAVE } from "../data/fresh-save.data.js";
import { STORAGE_UPGRADES } from "../data/storage.data.js";
import { ANIMATIONS } from "../data/animations.data.js";
import { POINT_CLASSES, POINT_TYPES, POINT_PROPS } from "../data/points.data.js";

import Global from "./global.js";
import GameSave from "./save.js";
import PointCollection from "../systems/point.collection.js";
import Generator from "../systems/generator.js";

import SaveProxy from "./proxy.js";
import Render from "../views/render.js";
import Animate from "../views/animate.js";
import Utils from "../utils/utils.js";

let lastUpdate = 0;
const updateInterval = 1600;

const render = new Render();
const animate = new Animate();
const utils = new Utils();

const generator = new Generator();

const saveProxy = new SaveProxy(FRESH_SAVE);
// const saveProxy = new SaveProxy(TEST_SAVE);
let proxySave = Global.proxy;// saveProxy.proxy;


const animations = ANIMATIONS;
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

// #endregion Elements

// #region Event Listeners

// Save
saveButton.addEventListener("click", () => GameSave.save(Global.proxy));
resetButton.addEventListener("click", () => GameSave.reset());
dump.addEventListener("click", () => dumpAllPoints());

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
    Global.proxy.points[type] += collection[type];
    Global.proxy.points_order.push(...new Array(collection[type]).fill(type));
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
      if (value > Global.proxy.points[key]) hasEnoughPoints = false;
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
    pointsSum += Global.proxy.points[type] - pointsToConsume[type];
  }
  if (pointsSum + totalToGenerate > Global.proxy.maxStorage) {
    animate.timedOut(pointsContainer, animations.tilt);
    doesOvercap = true;
  }
  return doesOvercap;
}

/**
 * @param {PointCollection.collection} pointsToConsume
 */
function consumePoints(pointsToConsume) {
  if (!pointsToConsume || typeof pointsToConsume !== 'object') return;

  for (const [key, valueToConsume] of Object.entries(pointsToConsume)) {
    if (valueToConsume) Global.proxy.points[key] -= valueToConsume;

    let pointsOrderItemsToRemove = valueToConsume;
    for (
      let i = Global.proxy.points_order.length - 1;
      i >= 0 && pointsOrderItemsToRemove > 0;
      i--
    ) {
      if (Global.proxy.points_order[i] === key) {
        Global.proxy.points_order.splice(i, 1);
        pointsOrderItemsToRemove--;
      }
    }
  }
}

function dumpAllPoints() {
  for (const type of pointProps) {
    Global.proxy.points[type] = 0;
  }
  Global.proxy.points_order = [];
}

// #endregion Points

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
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
    let proxyGenerator = getProxySaveGenerator(generatorName);
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
    let proxyGenerator = getProxySaveGenerator(generatorName);
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
    let proxyGenerator = getProxySaveGenerator(generatorName);
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
    let proxyGenerator = getProxySaveGenerator(generatorName);
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
function getProxySaveGenerator(generatorName) {
  return Global.proxy.generators.find(generator=> generator.name === generatorName);
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
    generatorOnClick,
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
  let proxyGenerator = getProxySaveGenerator(generatorName);
  if (!proxyGenerator || proxyGenerator.built || !proxyGenerator.canBuild) return;

  let dataGenerator = getGeneratorData(generatorName);
  if (!dataGenerator) return;

  const buildStep = dataGenerator.buildRequires.step;
  if (!hasEnoughPoints(buildStep)) return;

  consumePoints(buildStep);

  proxyGenerator.progress = proxyGenerator.progress ?? 0;
  proxyGenerator.progress += 1;

  if (proxyGenerator.progress >= dataGenerator.buildRequires.totalSteps) {
    proxyGenerator.built = true;
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

function generatorOnClick(generatorName) {
  let proxyGenerator = getProxySaveGenerator(generatorName);
  if (!proxyGenerator) return;

  if (proxyGenerator.built) {
    addPoints(generatorName);
    return;
  }
  if (proxyGenerator.canBuild) {
    buildGenerator(generatorName);
    return;
  }
  if (proxyGenerator.hinted) {
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
  let loadedSave = GameSave.load();
  setProxySave(loadedSave);
  setGeneratorsFromSave(Global.proxy.generators);

  Global.saveProxy.subscribe((updatedSave) => {
    GameSave.save(updatedSave);
    gameLoop();
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  let points = new PointCollection(Global.proxy.points);

  setStoragePoints(points, Global.proxy.points_order);
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
  Object.assign(Global.proxy, save);
}

function setGeneratorsFromSave(generators) {
  generator.newGenerator(generators);
}

startGame();

// #endregion Global
