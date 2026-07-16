import { VERSION } from '../VERSION';

declare const self: any;

function getRtWatcherServer(config: any): string {
    return config?.rtwatcher_config?.host || config?.RTWATCHER_SERVER || config?.RTWATCHER_HOST || location.protocol + '//' + location.host;
}

let _environment: any = {
    production: true,
    environment: VERSION,
    isHomerAPI: true,
    apiUrl: location.protocol + '//' + (location.host) + '/api/v3',
    rtWatcherServer: getRtWatcherServer(self?.GLOBAL_CONFIG),
};
if (typeof self?.GLOBAL_CONFIG == "object") {
    const { PREFIX, API_PATH } = self?.GLOBAL_CONFIG || {};
    if (API_PATH) {
        _environment.apiUrl = API_PATH;
    } else if (PREFIX) {
        _environment.apiUrl = location.protocol + '//' + (location.host) + PREFIX + 'api/v3';
    }
    _environment.rtWatcherServer = getRtWatcherServer(self?.GLOBAL_CONFIG);
}
export const environment = _environment;
