import { VERSION } from '../VERSION';

declare const self: any;

let _environment: any = {
    production: true,
    environment: VERSION,
    isHomerAPI: true,
    apiUrl: location.protocol + '//' + (location.host) + '/api/v3',
    rtWatcherUrl: location.protocol + '//' + (location.host) + '/api/extract/',
};
if (typeof self?.GLOBAL_CONFIG == "object") {
    const { PREFIX, API_PATH, RTWATCHER_API_PATH } = self?.GLOBAL_CONFIG || {};
    if (API_PATH) {
        _environment.apiUrl = API_PATH;
    } else if (PREFIX) {
        _environment.apiUrl = location.protocol + '//' + (location.host) + PREFIX + 'api/v3';
    }
    if (RTWATCHER_API_PATH) {
        _environment.rtWatcherUrl = RTWATCHER_API_PATH;
    }
}
export const environment = _environment;
