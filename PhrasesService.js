const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class PhrasesService {

    async init() {
        const auth = new JWT({
            email: process.env.CLIENT_EMAIL,
            key: process.env.PRIVATE_KEY,
            scopes: [
              'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        this.doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
        await this.doc.loadInfo();
    }

    async save(phrase, locationInfo, deviceInfo) {
        if(!this.doc) {
            await this.init();
        }
        const sheet = this.doc.sheetsByIndex[0];
        const dataObject = {
            phrase: phrase,
            city: locationInfo.city,
            region: locationInfo.region,
            country: locationInfo.country,
            browser: deviceInfo.browser,
            browser_version: deviceInfo.browser_version,
            os: deviceInfo.os,
            os_version: deviceInfo.os_version,
            device_model: deviceInfo.device_model,
            device_type: deviceInfo.device_type,
            device_vendor: deviceInfo.device_vendor,
            timestamp: Date.now()
        };

        await sheet.addRow(dataObject);
        return dataObject;
    }

    async get(amount) {
        if(!this.doc) {
            await this.init();
        }

        const sheet = this.doc.sheetsByIndex[0];
        let rows = await sheet.getRows({
            limit: 100000
        });

        // Devuelvo la cantidad de registros solicitados de manera random
        rows = getRandomRows(rows, amount);

        const UNKNOWN_CITY_TEXT = 'de algún lugar';
        const UNKNOWN_COUNTRY = 'algún país';
        const UNKNOWN_DEVICE_TEXT = 'algún dispositivo';
        const UNKNOWN_OS_TEXT = 'un sistema operativo';
        const UNKNOWN_BROWSER_TEXT = 'algún navegador';
        const EMPTY_PHRASE = 'no lo sé';

        const mapDataToJSON = (row) => {
            const browser = row.get('browser');
            const os = row.get('os');
            const deviceModel = row.get('device_model') || UNKNOWN_DEVICE_TEXT;
            const deviceType = row.get('device_type') || UNKNOWN_DEVICE_TEXT;
            const deviceVendor = row.get('device_vendor') || UNKNOWN_DEVICE_TEXT;
   
            const browserPart = browser ? `${browser}` : UNKNOWN_BROWSER_TEXT;
            const osPart = os ? `${os}` : UNKNOWN_OS_TEXT;
            const device = (deviceModel === deviceType && deviceType === deviceVendor) ? deviceModel : `${deviceModel}, ${deviceType}, ${deviceVendor}`

            return {
                phrase: `${row.get('phrase') || EMPTY_PHRASE}`,
                location: `${row.get('city') || UNKNOWN_CITY_TEXT}, ${row.get('country') || UNKNOWN_COUNTRY}`,
                device: `${device}`,
                os: `${osPart}, ${browserPart}`
            };
        };

        return rows.map(mapDataToJSON);
    }
}

const getRandomRows = (array, n) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

module.exports = PhrasesService;
