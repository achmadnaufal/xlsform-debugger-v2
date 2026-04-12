export default /** @type {const} */ ({
  experimentalOptimizations: {
    computeAsync: window.location.search.includes("&computeAsync"),
  },
  excludeNonRelevant: window.location.search.includes("&excludeNonRelevant"),
  maps: [
    {
      tiles: ["https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      name: "streets",
      attribution:
        "\u00a9 <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors",
    },
  ],
  googleApiKey: "",
  repeatOrdinals: false,
  validateContinuously: false,
  validatePage: true,
  swipePage: true,
  textMaxChars: 2000,
});
