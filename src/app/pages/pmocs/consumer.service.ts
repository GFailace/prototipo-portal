import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Pmoc, PmocService } from './pmoc.service';

@Injectable({ providedIn: 'root' })
export class ConsumerService {
    constructor(private pmocService: PmocService) {}

    // Returns PMOCs matching a consumer identifier. The matching logic is simple:
    // check if the pmoc.cliente includes the consumerId string or id equals it.
    getPmocsForConsumer(consumerId: string): Observable<Pmoc[]> {
        return this.pmocService.pmocs$.pipe(
            map((list) => list.filter((p) => p.cliente?.toLowerCase().includes(consumerId.toLowerCase()) || p.id === consumerId))
        );
    }
}
