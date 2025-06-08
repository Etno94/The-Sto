import { POINT_TYPES, POINT_PROPS } from "../data/points.data.js";

import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";

import PointCollection from "../systems/point.collection.js";
import InputController from "../systems/input.controller.js";

import DataManager from "../systems/managers/data.manager.js";
import PointManager from '../systems/managers/point.manager.js';
import GeneratorManager from "../systems/managers/generator.manager.js";
import StorageManager from "../systems/managers/storage.manager.js";

import Animate from "../views/helpers/animate.js";
import { UIControl } from "../views/ui-controller.js";
import Utils from "../utils/utils.js";
import {RenderQ} from "../views/helpers/render-queue.js";

let lastUpdate = 0;
const updateInterval = 1600;

const inputController = new InputController();
const pointM = new PointManager();
const generatorM = new GeneratorManager();
const storageM = new StorageManager();

const pointProps = POINT_PROPS;

// #region Elements

// Layout
const central = document.getElementById("central");
const pointsContainer = document.getElementById("points");

// #endregion Elements

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
}

function checkGeneratorUnlocks() {
  checkLockedGenerators([...generatorM.getLockedGenerators()]);
  checkHintedGenerators([...generatorM.getHintedGenerators()]);
  checkCanBeBuiltGenerators([...generatorM.getBuildableGenerators()]);
  checkBuiltGenerators([...generatorM.getBuitGenerators()]);
}

/**
 * @param {SaveGenerator[]} generators
 */
function checkLockedGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockHintRequires(generator.name))) {
      if (!generatorM.isHinted(generator.name)) generatorM.setHinted(generator.name);
    } else {
      if (generatorM.isHinted(generator.name)) generatorM.setHinted(generator.name, false);
    }
  });
}

/**
 * @param {SaveGenerator[]} generators
 */
function checkHintedGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockBuildRequires(generator.name))) {
      if (!generatorM.isBuildable(generator.name)) generatorM.setBuildable(generator.name);
    } 
    else {
      if (generatorM.isBuildable(generator.name)) generatorM.setBuildable(generator.name, false);
      const generatorElement = getGeneratorElement(generator.name);
      showHint(generatorElement);
      registerGeneratorAction(generatorElement, generator.name);
    }
  });
}

/**
 * @param {SaveGenerator[]} generators
 */
function checkCanBeBuiltGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    const generatorElement = getGeneratorElement(generator.name);
    showBuild(generatorElement, generatorM.whatBuildStepRequires(generator.name));
    registerGeneratorAction(generatorElement, generator.name);
  });
}

/**
 * @param {SaveGenerator[]} generators
 */
function checkBuiltGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    const generatorElement = getGeneratorElement(generator.name);
    showGeneratorElement(generatorElement);
    registerGeneratorAction(generatorElement, generator.name);
  });
}


/**
 * @param {string} generatorName 
 * @returns {HTMLElement}
 */
function getGeneratorElement(generatorName) {
  return document.getElementById(generatorName) ?? UIControl.renderGenerator(generatorName, 'no-width');
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
  if (UIControl.hasCostPreview(generatorElement)) return;

  const costPreviewElement = UIControl.renderCostPreview();
  for (let pointType in buildCosts) {
    costPreviewElement.appendChild(UIControl.renderPoint(pointType));
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
  Animate.widthIn(generatorElement);
}

// #endregion Unlocks

// #region Build

function buildGenerator(generatorName) {
  if (!generatorM.isValidGenerator(generatorName) || generatorM.isBuilt(generatorName) || !generatorM.isBuildable(generatorName)) return;

  const buildStep = generatorM.whatBuildStepRequires(generatorName);
  if (!pointM.hasEnoughPoints(buildStep)) return;
  EventBus.emit(Events.points.substract, buildStep);

  generatorM.buildProgress(generatorName, DataManager.getDefaultStepProgress());

  if (generatorM.isBuildProgressComplete(generatorName)) {
    generatorM.setBuilt(generatorName);
    checkGeneratorBuilt(generatorName);
  }
}

function checkGeneratorBuilt(generatorName) {
  let generatorElement = getGeneratorElement(generatorName);
  showGeneratorElement(generatorElement);

  if (generatorElement.classList.contains("blank"))
    generatorElement.classList.remove("blank");

  UIControl.removeCostPreview(generatorElement);
}

// #endregion Build

// #region Generator Actions

function generatorOnClick(generatorName) {
  if (!generatorM.isValidGenerator(generatorName)) return;

  console.log(`Clicked gen: ${generatorName}`);

  if (generatorM.isBuilt(generatorName)) {
    builtGeneratorOnClick(generatorName);
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

/**
 * @param { string } generatorName 
 */
function builtGeneratorOnClick (generatorName) {
  const consumePCollection = new PointCollection(generatorM.whatConsumes(generatorName));
  const generatePCollection = new PointCollection(generatorM.whatGenerates(generatorName));

  let canConsume = true;
  let canGenerate = true;

  if (consumePCollection.total && !pointM.hasEnoughPoints(consumePCollection.collection)) canConsume = false;
  if (generatePCollection.total && storageM.doesOvercap(
    pointM.getCurrentTotalPoints(), generatePCollection.total, consumePCollection.total)
  ) {
    canGenerate = false;
    EventBus.emit(Events.points.overcap);
  }

  if (canConsume && canGenerate) {
    if (consumePCollection.total) EventBus.emit(Events.points.substract, consumePCollection.collection);
    if (generatePCollection.total) EventBus.emit(Events.points.add, generatePCollection.collection);
  }
}

// #endregion Generator Actions

// #region Render

/**
 * @param {Collection} points
 * @param {string[]} orderedPoints
 */
async function setStoragePoints(points, orderedPoints) {
  // Guards
  for (let [key, value] of Object.entries(points.collection)) {
    if (value === null || value === undefined) return;
    if (!pointProps.includes(key)) return;
  }
  if (!Array.isArray(orderedPoints) || !orderedPoints) return;
  if (!pointsContainer) return;
  // -Guards

  let { point: currentBasicPoints, solid_point: currentSolidPoints, energy_point: currentEnergyPoints } = UIControl.getCurrentPointsFromDOM();

  RenderQ.queue(removePoints, currentBasicPoints, points.collection.point, POINT_TYPES.point);
  RenderQ.queue(removePoints, currentSolidPoints, points.collection.solid_point, POINT_TYPES.solid_point);
  RenderQ.queue(removePoints, currentEnergyPoints, points.collection.energy_point, POINT_TYPES.energy_point);

  RenderQ.queue(renderPoints, currentBasicPoints, points.collection.point, POINT_TYPES.point);
  RenderQ.queue(renderPoints, currentSolidPoints, points.collection.solid_point, POINT_TYPES.solid_point);
  RenderQ.queue(renderPoints, currentEnergyPoints, points.collection.energy_point, POINT_TYPES.energy_point);
}


/**
 * @param {number} currentPoints 
 * @param {number} pointsToMatch 
 * @param {string} pointType 
 * @returns 
 */
function renderPoints(currentPoints, pointsToMatch, pointType){
  if (currentPoints >= pointsToMatch) return;

  while (currentPoints < pointsToMatch) {
      let pointToAppend = UIControl.renderPoint(pointType, "no-width");
      pointsContainer.appendChild(pointToAppend);
      Animate.widthIn(pointToAppend);
      
      currentPoints++;
  }
}

/**
 * @param {number} currentPoints 
 * @param {number} pointsToMatch 
 * @param {string} pointType 
 * @returns 
 */
async function removePoints(currentPoints, pointsToMatch, pointType) {
  if (currentPoints <= pointsToMatch) return;

  while (currentPoints > pointsToMatch) {
      await UIControl.removePoint(pointsContainer, pointType);
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
  registerBusEvents();
  generatorM.setNewGeneratorManager();
  storageM.setCurrentStorage(Global.proxy.storage.maxStorageUpgradeCurrentLevel);

  Global.saveProxy.subscribe((updatedSave) => {
    GameSave.save(updatedSave);
    gameLoop();
  });
  if (!save) requestAnimationFrame(gameLoop);
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

function registerBusEvents() {
  EventBus.on(Events.points.add, (message) => console.log(`[think] ${Events.points.add}`, message));
  EventBus.on(Events.points.substract, (message) => console.log(`[think] ${Events.points.substract}`, message));
}

startGame();

// #endregion Global
