// @ts-ignore
const credentials = {
  engineId: `${process.env.CLINIA_ENGINE_ID_1}`,
  apiKey: `${process.env.CLINIA_SEARCH_KEY_1}`
};

const version = require("../lerna.json").version;

["clinia-lite.com", "clinia.com"].forEach(preset => {
  describe(`search features - ${preset}`, () => {
    beforeEach(async () => browser.url(preset));

    it("throws api errors", async () => {
      const headers =
        preset === "clinia.com"
          ? {
              "content-type": "application/json",
              "x-clinia-api-key": "*****",
              "x-clinia-engine-id": "NOCTT5TZUU"
            }
          : {
              "content-type": "application/json"
            };

      let url = `https://api.partner.clinia.ca/search/v1/indexes/SDFGHJKL/query?x-clinia-agent=Clinia%20for%20JavaScript%20(${version})%3B%20Browser`;

      if (preset === "clinia-lite.com") {
        url += `%20(lite)&x-clinia-api-key=${credentials.apiKey}&x-clinia-engine-id=${credentials.engineId}`;
      }

      const err = await browser.executeAsync(function(credentials, done) {
        const client = clinia(credentials.engineId, credentials.apiKey);

        const index = client.initIndex("SDFGHJKL");

        index.search("").then(undefined, done);
      }, credentials);

      expect(err.transporterStackTrace[0].host).toEqual({
        accept: 1,
        protocol: "https",
        url: `api.partner.clinia.ca`
      });

      expect(err.transporterStackTrace[0].request).toEqual({
        connectTimeout: 1,
        data: '{"query":""}',
        headers: headers,
        method: "POST",
        responseTimeout: 2,
        url: url
      });

      expect(err.transporterStackTrace[0].triesLeft).toBe(3);

      expect(err.name).toBe('ApiError');
      expect(err.status).toBe(404);
      expect(err.message).toBe('Index SDFGHJKL does not exist');
    });
  });
});
