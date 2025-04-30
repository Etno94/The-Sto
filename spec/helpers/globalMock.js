global.getComputedStyle = function () {
    return {
      getPropertyValue: function () {
        return ""; // Return a default value or mock value as needed
      },
    };
  };

  console.log("globalMock.js loaded");
// export default global.getComputedStyle;