export default {
  spec_dir: ".",
  spec_files: [
    "**/*.spec.js"
  ],
  helpers: [
    "./helpers/globalMock.js",
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: false
  }
}
