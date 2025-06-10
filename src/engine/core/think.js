import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";

import PointCollection from "../systems/point.collection.js";
import InputControl from "../systems/input.controller.js";

import DataManager from "../systems/managers/data.manager.js";
import PointManager from '../systems/managers/point.manager.js';
import GeneratorManager from "../systems/managers/generator.manager.js";
import StorageManager from "../systems/managers/storage.manager.js";

import { UIControl } from "../views/ui-controller.js";
import {RenderQ} from "../views/helpers/render-queue.js";
import Asserts from "../utils/asserts.js";

let lastUpdate = 0;
const updateInterval = 1600;

const pointM = new PointManager();
const generatorM = new GeneratorManager();
const storageM = new StorageManager();

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
}

function checkGeneratorUnlocks() {
  checkLockedGenerators([...generatorM.getLockedGeneratorNames()]);
  checkHintedGenerators([...generatorM.getHintedGeneratorNames()]);
  checkCanBeBuiltGenerators([...generatorM.getBuildableGeneratorNames()]);
  checkBuiltGenerators([...generatorM.getBuitGeneratorNames()]);
}

/** @param {string[]} generatorNames */
function checkLockedGenerators(generatorNames) {

  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockHintRequires(generatorName))) {
      if (!generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName);
    } else {
      if (generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName, false);
    }
  });
}

/** @param {string[]} generatorNames */
function checkHintedGenerators(generatorNames) {

  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockBuildRequires(generatorName))) {
      if (!generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName);
    } 
    else {
      if (generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName, false);
      const generatorElement = UIControl.getGeneratorElement(generatorName);
      UIControl.showHint(generatorElement);
      UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
      InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
    }
  });
}

/** @param {string[]} generatorNames */
function checkCanBeBuiltGenerators(generatorNames) {

  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    const generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showBuild(generatorElement);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
    UIControl.renderCostPreview(generatorElement, generatorM.whatBuildStepRequires(generatorName));
    InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
  });
}

/** @param {string[]} generatorNames */
function checkBuiltGenerators(generatorNames) {

  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    const generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
      InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
  });
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
 * @param {PointSet} points
 */
async function setStoragePoints(points) {
  Asserts.noNullValuesObject(points);

  let { point: currentBasicPoints, solid_point: currentSolidPoints, energy_point: currentEnergyPoints } = UIControl.getCurrentPointsFromDOM();

  RenderQ.queue(removePoints, currentBasicPoints, points.point, DataManager.getPointTypesData().point);
  RenderQ.queue(removePoints, currentSolidPoints, points.solid_point, DataManager.getPointTypesData().solid_point);
  RenderQ.queue(removePoints, currentEnergyPoints, points.energy_point, DataManager.getPointTypesData().energy_point);

  RenderQ.queue(renderPoints, currentBasicPoints, points.point, DataManager.getPointTypesData().point);
  RenderQ.queue(renderPoints, currentSolidPoints, points.solid_point, DataManager.getPointTypesData().solid_point);
  RenderQ.queue(renderPoints, currentEnergyPoints, points.energy_point, DataManager.getPointTypesData().energy_point);
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
  setStoragePoints(new PointCollection(Global.proxy.points).collection);

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
