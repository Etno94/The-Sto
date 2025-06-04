import { ANIMATIONS } from "../data/animations.data.js";
import { POINT_TYPES, POINT_PROPS } from "../data/points.data.js";

import Global from "./global.js";
import GameSave from "./save.js";

import DataManager from "../systems/data.manager.js";
import PointCollection from "../systems/point.collection.js";
import GeneratorManager from "../systems/generator.manager.js";
import StorageManager from "../systems/storage.manager.js";

import Render from "../views/render.factory.js";
import Animate from "../views/animate.js";
import Utils from "../utils/utils.js";

let lastUpdate = 0;
const updateInterval = 1600;

const render = new Render();
const animate = new Animate();
const generatorM = new GeneratorManager();
const storageM = new StorageManager();

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
  if (!generatorM.isValidGenerator(generatorName)) return;

  let pointsToConsume = new PointCollection(generatorM.whatConsumes(generatorName));

  if (!hasEnoughPoints(pointsToConsume.collection)) return;

  let pointsToGenerate = new PointCollection(generatorM.whatGenerates(generatorName));
  let totalPoints = new PointCollection(Global.proxy.points).total;

  if (storageM.doesOvercap(totalPoints, pointsToGenerate.total, pointsToConsume.total)) {
    animate.timedOut(pointsContainer, animations.tilt);
    return;
  }

  // Consume
  if (pointsToConsume.total) {
    consumePoints(pointsToConsume.collection);
  }

  // Generate
  let collection = pointsToGenerate.collection;
  for (const type of pointProps) {
    Global.proxy.points[type] += collection[type];
    Global.proxy.points_order.push(...new Array(collection[type]).fill(type));
  }
}

/**
 * @param {PointSet} pointsToMeet
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
 * @param {PointSet} pointsToConsume
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
  checkLockedGenerators([...generatorM.lockedGens]);
  checkHintedGenerators([...generatorM.hintedGens]);
  checkCanBeBuiltGenerators([...generatorM.canBuildGens]);
  checkBuiltGenerators([...generatorM.builtGens]);
}

/**
 * @param {string[]} generators
 */
function checkLockedGenerators(generators) {

  generators.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (hasEnoughPoints(generatorM.whatUnlockHintRequires(generatorName))) {
      if (!generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName);
      generatorM.canBeHinted(generatorName);
    } else {
      if (generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName, false);
    }
  });
}

/**
 * @param {string[]} generators
 */
function checkHintedGenerators(generators) {

  generators.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (hasEnoughPoints(generatorM.whatUnlockBuildRequires(generatorName))) {
      if (!generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName);
      generatorM.canBeBuilt(generatorName);
    } 
    else {
      if (generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName, false);
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
    if (!generatorM.isValidGenerator(generatorName)) return;

    const generatorElement = getGeneratorElement(generatorName);
    showBuild(generatorElement, generatorM.whatBuildStepRequires(generatorName));
    registerGeneratorAction(generatorElement, generatorName);
  });
}

/**
 * @param {string[]} generators
 */
function checkBuiltGenerators(generators) {

  generators.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

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
 * @returns {HTMLElement}
 */
function getGeneratorElement(generatorName) {
  return document.getElementById(generatorName) ?? render.renderGenerator(generatorName, 'no-width');
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
  
  Utils.addEventListenerWithFlag(
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

  central.insertBefore(
    generatorElement, 
    central.children[
      generatorM.getOrderedGeneratorIndex(generatorElement.id)
    ]);
  animate.widthIn(generatorElement);
}

// #endregion Unlocks

// #region Build

function buildGenerator(generatorName) {
  if (!generatorM.isValidGenerator(generatorName) || generatorM.isBuilt(generatorName) || !generatorM.isBuildable(generatorName)) return;

  const buildStep = generatorM.whatBuildStepRequires(generatorName);
  if (!hasEnoughPoints(buildStep)) return;
  consumePoints(buildStep);

  generatorM.buildProgress(generatorName, DataManager.getDefaultStepProgress());

  if (generatorM.isBuildProgressComplete(generatorName)) {
    generatorM.setBuilt(generatorName);
    generatorM.hasBeenBuilt(generatorName);
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
  if (!generatorM.isValidGenerator(generatorName)) return;

  if (generatorM.isBuilt(generatorName)) {
    addPoints(generatorName);
    return;
  }
  if (generatorM.isBuildable(generatorName)) {
    buildGenerator(generatorName);
    return;
  }
  if (generatorM.isHinted(generatorName)) {
    console.log("You see a new thing...");
  }
}

// #endregion Generator

// #region Render

/**
 * @param {Collection} points
 * @param {string[]} orderedPoints
 */
function setStoragePoints(points, orderedPoints) {
  // Guards
  for (let [key, value] of Object.entries(points.collection)) {
    if (value === null || value === undefined) return;
    if (!pointProps.includes(key)) return;
  }
  if (!Array.isArray(orderedPoints) || !orderedPoints) return;
  if (!pointsContainer) return;
  // -Guards

  // Render points as necessary
  let currentBasicPoints = 0;
  let currentSolidPoints = 0;
  let currentEnergyPoints = 0;

  Array.from(pointsContainer.children).forEach((child) => {
    switch(child.dataset.pointType) {
      case POINT_TYPES.energy_point:
        currentEnergyPoints++;
        break;
      case POINT_TYPES.solid_point:
        currentSolidPoints++;
        break;
      case POINT_TYPES.point:
        currentBasicPoints++
        break;
    }
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
  const save = GameSave.load();
  if(save && typeof save === 'object') {
    Object.assign(Global.proxy, save);
  }
  generatorM.setNewGeneratorManager();
  storageM.setCurrentStorage(Global.proxy.storage.maxStorageUpgradeCurrentLevel);

  Global.saveProxy.subscribe((updatedSave) => {
    GameSave.save(updatedSave);
    gameLoop();
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  setStoragePoints(
    new PointCollection(Global.proxy.points), 
    Global.proxy.points_order);

  checkUnlocks();

  // requestAnimationFrame(gameLoop);

  // if (timestamp - lastUpdate >= updateInterval) {
  //     setStoragePoints(proxySave.points, proxySave.solid_points, proxySave.energy_points);
  //     checkUnlocks();
  //     lastUpdate = timestamp;
  // }
  // requestAnimationFrame(gameLoop);
}

startGame();

// #endregion Global
