import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";

import PointCollection from "../systems/point.collection.js";
import InputControl from "../systems/input.controller.js";

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

const pointM = new PointManager();
const generatorM = new GeneratorManager();
const storageM = new StorageManager();

// Layout
const pointsContainer = document.getElementById("points");

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

/** @param {SaveGenerator[]} generators */
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

/** @param {SaveGenerator[]} generators */
function checkHintedGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockBuildRequires(generator.name))) {
      if (!generatorM.isBuildable(generator.name)) generatorM.setBuildable(generator.name);
    } 
    else {
      if (generatorM.isBuildable(generator.name)) generatorM.setBuildable(generator.name, false);
      const generatorElement = UIControl.getGeneratorElement(generator.name);
      showHint(generatorElement);
      registerGeneratorAction(generatorElement, generator.name);
    }
  });
}

/** @param {SaveGenerator[]} generators */
function checkCanBeBuiltGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    const generatorElement = UIControl.getGeneratorElement(generator.name);
    showBuild(generatorElement, generatorM.whatBuildStepRequires(generator.name));
    registerGeneratorAction(generatorElement, generator.name);
  });
}

/** @param {SaveGenerator[]} generators */
function checkBuiltGenerators(generators) {

  generators.forEach(generator => {
    if (!generatorM.isValidGenerator(generator.name)) return;

    const generatorElement = UIControl.getGeneratorElement(generator.name);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
    registerGeneratorAction(generatorElement, generator.name);
  });
}

/** @param {HTMLElement} generatorElement */
function showHint(generatorElement) {
  if (!generatorElement.classList.contains("hint"))
    generatorElement.classList.add("hint");

  UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
}

function showBuild(generatorElement, generatorData) {
  if (!generatorElement.classList.contains("blank"))
    generatorElement.classList.add("blank");
  if (generatorElement.classList.contains("hint"))
    generatorElement.classList.remove("hint");

  UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));

  showCostPreview(generatorElement, generatorData);
}

/**
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
  let generatorElement = UIControl.getGeneratorElement(generatorName);
  UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));

  if (generatorElement.classList.contains("blank"))
    generatorElement.classList.remove("blank");

  UIControl.removeCostPreview(generatorElement);
}

// #endregion Build

// #region Generator Actions

function generatorOnClick(generatorName) {
  if (!generatorM.isValidGenerator(generatorName)) return;

  EventBus.emit(Events.generator.onClick, generatorName);

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

/** @param { string } generatorName */
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
    if (!DataManager.getPointPropsData().includes(key)) return;
  }
  if (!Array.isArray(orderedPoints) || !orderedPoints) return;
  if (!pointsContainer) return;
  // -Guards

  let { point: currentBasicPoints, solid_point: currentSolidPoints, energy_point: currentEnergyPoints } = UIControl.getCurrentPointsFromDOM();

  RenderQ.queue(removePoints, currentBasicPoints, points.collection.point, DataManager.getPointTypesData().point);
  RenderQ.queue(removePoints, currentSolidPoints, points.collection.solid_point, DataManager.getPointTypesData().solid_point);
  RenderQ.queue(removePoints, currentEnergyPoints, points.collection.energy_point, DataManager.getPointTypesData().energy_point);

  RenderQ.queue(renderPoints, currentBasicPoints, points.collection.point, DataManager.getPointTypesData().point);
  RenderQ.queue(renderPoints, currentSolidPoints, points.collection.solid_point, DataManager.getPointTypesData().solid_point);
  RenderQ.queue(renderPoints, currentEnergyPoints, points.collection.energy_point, DataManager.getPointTypesData().energy_point);
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
      UIControl.generatePoint(pointType);
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
      await UIControl.removePoint(pointType);
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
