class PhrasesService {

    constructor() {
        this.data = [];
    }
    
    save(phrase, locationInfo, deviceInfo) {
        const dataObject = {
            phrase: phrase,
            country: locationInfo.country,
            city: locationInfo.city,
            browser: deviceInfo.browser,
            browser_version: deviceInfo.browser_version,
            os: deviceInfo.os,
            os_version: deviceInfo.os_version,
            device: deviceInfo.device,
            timestamp: Date.now()
        };

        this.data.push(dataObject);
        return dataObject;
    }

    get(amount) {
        const mapDataToJSON = (item) => {
            return {
                phrase: item.phrase,
                location: `${item.city}, ${item.country}`,
                device: `${item.browser} ${item.browser_version}, ${item.os} ${item.os_version}`
            };
        };

        if (amount >= this.data.length) {
            return this.data.map(mapDataToJSON);
        }
    
        const dataCopy = [...this.data];
    
        for (let i = dataCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
        }

        const selectedData = dataCopy.slice(0, amount);
    
        return selectedData.map(mapDataToJSON);
    }
}

module.exports = PhrasesService;