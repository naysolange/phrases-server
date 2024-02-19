const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class PhrasesService {

    async init() {
        const auth = new JWT({
            email: process.env.client_email,
            key: process.env.private_key,
            scopes: [
              'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        this.doc = new GoogleSpreadsheet(process.env.spreadsheet_id || credentials.spreadsheet_id, auth);
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

        const UNKNOWN_LOCATION_TEXT = 'algún lugar del mundo';
        const UNKNOWN_DEVICE_TEXT = 'algún dispositivo';
        const UNKNOWN_OS_TEXT = 'algún navegador';

        const mapDataToJSON = (row) => {
            const unknownLocationText = UNKNOWN_LOCATION_TEXT;
            const unknownDeviceText = UNKNOWN_DEVICE_TEXT;
            const unknownOSText = UNKNOWN_OS_TEXT;

            return {
                phrase: row.get('phrase'),
                location: row.get('city') || row.get('region') || row.get('country') ? `${row.get('city') || unknownLocationText}, ${row.get('region') || unknownLocationText}, ${row.get('country') || unknownLocationText}` : unknownLocationText,
                device: row.get('device_model') || row.get('device_type') || row.get('device_vendor') ? `${row.get('device_model') || unknownDeviceText}, ${row.get('device_type') || unknownDeviceText}, ${row.get('device_vendor') || unknownDeviceText}` : unknownDeviceText,
                os: `${row.get('browser') || unknownOSText} ${row.get('browser_version') || unknownOSText}, ${row.get('os') || unknownOSText} ${row.get('os_version') || unknownOSText}`
            };
        };

        return rows.map(mapDataToJSON);
    }
}

module.exports = PhrasesService;
