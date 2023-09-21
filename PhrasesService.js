class PhrasesService {

    constructor() {
        this.data = [];
    }
    
    save(phrase, locationInfo, deviceInfo) {
        const dataObject = {
            phrase: phrase,
            timestamp: new Date().toUTCString(),
            location_info: locationInfo,
            device_info: deviceInfo
        };

        this.data.push(dataObject);
        return dataObject;
    }

    get(amount) {
        const mapDataToJSON = (item) => {
            return {
                phrase: item.phrase,
                location: `${item.location_info.city}, ${item.location_info.country}`,
                device: `${item.device_info.browser}, ${item.device_info.os}`
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