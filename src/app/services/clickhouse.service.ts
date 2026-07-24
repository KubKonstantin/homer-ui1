import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ClickhouseSerivce {

    private url = `${environment.apiUrl}/clickhouse`;

    constructor(private http: HttpClient) { }

    getRawQuery(data): Observable<any> {
        if (this.sanitize(data)) {
            return this.http.post<any>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseDbList(): Observable<any> {
        const data = {
            query: `SELECT name FROM system.databases ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<any>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseTableList(database): Observable<any> {
        const data = {
            query: `SELECT name FROM system.tables WHERE database = '${database}' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<any>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getClickhouseColumnList(database, table): Observable<any> {
        const data = {
            query: `SELECT name, type FROM system.columns WHERE database = '${database}'
            AND table = '${table}' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<any>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    getNisqaMetrics(query: string, config: any = {}): Observable<any> {
        if (!config?.host) {
            return this.getRawQuery({ query });
        }

        let params = new HttpParams()
            .set('default_format', 'JSONEachRow');
        if (config.database) {
            params = params.set('database', config.database);
        }
        if (config.user) {
            params = params.set('user', config.user);
        }
        if (config.password) {
            params = params.set('password', config.password);
        }

        const url = this.normalizeUrl(config.host);
        return this.http.post(url, query, {
            params,
            responseType: 'text',
            headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=UTF-8' })
        }).pipe(
            catchError(() => this.http.get(url, {
                params: params.set('query', query),
                responseType: 'text'
            })),
            map(response => ({ data: this.parseJsonEachRow(response) }))
        );
    }

    private normalizeUrl(url: string): string {
        return `${url}`.replace(/\/+$/, '');
    }

    private parseJsonEachRow(response: string): Array<any> {
        return `${response || ''}`
            .split('\n')
            .map(row => row.trim())
            .filter(row => row.length > 0)
            .map(row => JSON.parse(row));
    }

    getClickhouseTimeDate(database, table): Observable<any> {
        const data = {
            query: `SELECT name FROM system.columns WHERE database = '${database}'
            AND table = '${table}' AND type LIKE 'DateTime%' ORDER BY name`
        };
        if (this.sanitize(data)) {
            return this.http.post<any>(`${this.url}/query/raw`, data);
        } else {
            return EMPTY;
        }
    }
    sanitize(data) {
        const regexp = new RegExp(/\bDROP\b|\bINSERT\b|\bCREATE\b|\bALTER\b|\bGRANT\b|\bREVOKE\b|\bDETACH\b|\bKILL\b|\bOPTIMIZE\b|\bSET\b|\bTRUNCATE\b|\bATTACH\b|\bRENAME\b/, 'mi');
        return !regexp.test(data.query);
    }
}