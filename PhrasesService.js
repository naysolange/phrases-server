class PhrasesService {

    constructor() {
        this.data = [];
    }
    
    save(phrase, location) {
        const dataObject = {
            phrase: phrase,
            timestamp: new Date().toUTCString(),
            location: location,
        };

        this.data.push(dataObject);
        return dataObject;
    }

    get(amount) {
        if (amount >= this.data.length) {
          return this.data.map((item) => item.phrase); 
        }
    
        const dataCopy = [...this.data];
    
        for (let i = dataCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
        }

        const selectedData = dataCopy.slice(0, amount);
    
        const phrases = selectedData.map((item) => item.phrase);
    
        return phrases;
    }
}

module.exports = PhrasesService;