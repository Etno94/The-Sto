// Note: cooldown measured in MS. 1000 MS = 1 second.

import { FRESH_SAVE, TEST_SAVE } from "./data/fresh-save.data.js";
import { STORAGE_UPGRADES } from "./data/storage.data.js";
import { GENERATOR_IDS, GENERATORS } from "./data/generators.data.js";
import { ANIMATIONS } from "./data/animations.data.js";
import { POINT_CLASSES, POINT_TYPES, POINT_PROPS } from "./data/points.data.js";

import PointCollection from "./modules/point.collection.js";

import SaveProxy from "./classes/proxy.js";
import Render from "./classes/render.js";
import Animate from "./classes/animate.js";
import Utils from "./classes/utils.js";

let localSave = localStorage.getItem("save");

let lastUpdate = 0;
const updateInterval = 1600;

const render = new Render();
const animate = new Animate();
const utils = new Utils();

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
saveButton.addEventListener("click", () => saveGame());
resetButton.addEventListener("click", () => resetGame());
dump.addEventListener("click", () => dumpAllPoints());

// Generators
clickGenerator.addEventListener("click", () =>
  generatorOnAction(GENERATOR_IDS.CLICK)
);

// #endregion Event Listeners

// #region Save

function loadSave() {
  if (localSave) {
    const loadedSave = JSON.parse(localSave);
    Object.assign(proxySave, loadedSave);
  }
}

function saveGame() {
  localStorage.setItem("save", JSON.stringify(proxySave));
}

function resetGame() {
  localStorage.removeItem("save");
  location.reload();
}

// #endregion Save

// #region Points

function addPoints(generatorName) {
  // Guards
  const generator = GENERATORS.find(
    (generator) => generator.name == generatorName
  );
  if (!generator) return;

  let pointsToConsume = new PointCollection();
  if (generator.consumes) {
    pointsToConsume.set(generator.consumes);
  }
  let pointsToConsumeCollection = pointsToConsume.collection;

  if (!hasEnoughPoints(pointsToConsumeCollection)) return;

  let pointsToGenerate = new PointCollection();
  if (generator.generates) {
    pointsToGenerate.set(generator.generates);
  }
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
  GENERATORS.forEach((generator) => {
    if (!generator["unlockRequires"]) return;

    let currentGenerator = proxySave.generators.find(
      (value) => value.name === generator.name
    );
    if (!currentGenerator) return;

    if (currentGenerator.built) {
      let generatorElement = document.getElementById(currentGenerator.name);
      if (!generatorElement) {
        generatorElement = render.renderGenerator(currentGenerator.name);
        central.appendChild(generatorElement);
        animate.widthIn(generatorElement);
      }

      utils.addEventListenerWithFlag(
        generatorElement,
        "click",
        generatorOnAction,
        currentGenerator.name
      );

      return;
    }

    if (
      currentGenerator.progress ||
      (generator["unlockRequires"]["build"] &&
        hasEnoughPoints(generator["unlockRequires"]["build"]))
    ) {
      if (!currentGenerator.canBuild) currentGenerator.canBuild = true;

      const generatorElement =
        document.getElementById(generator.name) ??
        render.renderGenerator(generator.name);
      showBuild(generatorElement, generator);

      utils.addEventListenerWithFlag(
        generatorElement,
        "click",
        generatorOnAction,
        currentGenerator.name
      );

      return;
    }

    if (
      generator["unlockRequires"]["hint"] &&
      hasEnoughPoints(generator["unlockRequires"]["hint"])
    ) {
      if (!currentGenerator.hinted) currentGenerator.hinted = true;

      const generatorElement =
        document.getElementById(generator.name) ??
        render.renderGenerator(generator.name);
      showHint(generatorElement);

      utils.addEventListenerWithFlag(
        generatorElement,
        "click",
        generatorOnAction,
        currentGenerator.name
      );
    }
  });
}

function showHint(generatorElement) {
  if (!generatorElement.classList.contains("hint"))
    generatorElement.classList.add("hint");

  central.appendChild(generatorElement);
  animate.widthIn(generatorElement);
}

function showBuild(generatorElement, generatorData) {
  if (!generatorElement.classList.contains("blank"))
    generatorElement.classList.add("blank");
  if (generatorElement.classList.contains("hint"))
    generatorElement.classList.remove("hint");

  central.appendChild(generatorElement);

  if (generatorElement.classList.contains("no-width")) {
    animate.widthIn(generatorElement);
  }

  if (render.hasCostPreview(generatorElement)) return;

  const costPreviewElement = render.renderCostPreview();

  for (let p in generatorData.buildRequires.step) {
    costPreviewElement.appendChild(render.renderPoint(p));
  }

  generatorElement.appendChild(costPreviewElement);
}

// #endregion Unlocks

// #region Build

function buildGenerator(generatorName) {
  const generator = GENERATORS.find(
    (generator) => generator.name === generatorName
  );

  if (!generator) return;

  const currentGenerator = proxySave.generators.find(
    (value) => value.name === generator.name
  );

  if (!currentGenerator) return;

  if (currentGenerator.built || !currentGenerator.canBuild) return;

  const buildStep = generator.buildRequires.step;

  if (!hasEnoughPoints(buildStep)) return;

  consumePoints(buildStep);

  if (!currentGenerator.progress) currentGenerator.progress = 0;

  currentGenerator.progress += 1;

  if (currentGenerator.progress >= generator.buildRequires.totalSteps) {
    currentGenerator.built = true;
    checkGeneratorBuilt(generatorName);
  }
}

function checkGeneratorBuilt(generatorName) {
  let generatorElement = document.getElementById(generatorName);
  if (!generatorElement) {
    generatorElement = render.renderGenerator(generatorName);
    central.appendChild(generatorElement);
    animate.widthIn(generatorElement);
  }
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
  loadSave();

  saveProxy.subscribe((updatedSave) => {
    saveGame();
    gameLoop();
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  let points = new PointCollection();
  points.set(proxySave.points);

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

startGame();

// #endregion Global
