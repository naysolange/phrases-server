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
        const rows = await sheet.getRows({
            limit: amount,
            orderby: 'timestamp',
            reverse: true
        });

        const UNKNOWN_LOCATION_TEXT = 'algún lugar';
        const UNKNOWN_DEVICE_TEXT = 'algún dispositivo';
        const UNKNOWN_OS_TEXT = 'algún sistema operativo';
        const UNKNOWN_BROWSER_TEXT = 'algún navegador';

        const mapDataToJSON = (row) => {
            const browser = row.get('browser');
            const os = row.get('os');
    
            const browserPart = browser ? `${browser}` : UNKNOWN_BROWSER_TEXT;
            const osPart = os ? `${os}` : UNKNOWN_OS_TEXT;

            return {
                phrase: row.get('phrase'),
                location: row.get('city') || row.get('region') || row.get('country') ? `${row.get('city') || UNKNOWN_LOCATION_TEXT}, ${row.get('region') || UNKNOWN_LOCATION_TEXT}, ${row.get('country') || UNKNOWN_LOCATION_TEXT}` : UNKNOWN_LOCATION_TEXT,
                device: row.get('device_model') || row.get('device_type') || row.get('device_vendor') ? `${row.get('device_model') || UNKNOWN_DEVICE_TEXT}, ${row.get('device_type') || UNKNOWN_DEVICE_TEXT}, ${row.get('device_vendor') || UNKNOWN_DEVICE_TEXT}` : UNKNOWN_DEVICE_TEXT,
                os: `${osPart}, ${browserPart}`
            };
        };

        return rows.map(mapDataToJSON);
    }
}

module.exports = PhrasesService;
