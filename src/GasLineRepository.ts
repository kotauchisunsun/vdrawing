import LineRepositoryInterface from './LineRepositoryInterface';
import Line from './Line';
import axios from 'axios';
import { DateTime } from 'luxon';
import uuidv4 from 'uuid/v4';
import Point from './Point';


export default class GasLineRepository implements LineRepositoryInterface {
    constructor(readonly url: string) {
    }

    public async getLine(id: string): Promise<Line> {
        const response = await axios.get(
            this.url,
            {
                params: {
                    action : 'get',
                    key : id,
                },
            },
        );

        if (response.status === 200 && response.data.status === 'OK') {
            const values = JSON.parse(response.data.value);
            const data = values.points.map( (x: any) => {
                return new Point(x[0], x[1]);
            });
            const points: Point[] = Array.from(data);
            return new Line(
                points,
                DateTime.fromMillis(Date.parse(values.createdAt as string)).toJSDate(),
            );
        }

        throw new Error();
    }

    public async gets(): Promise<Line[]> {
        const response = await axios.get(
            this.url,
            {
                params: {
                    action: 'gets',
                },
            },
        );

        if (response.status === 200 && response.data.status === 'OK') {
            const self = this;
            const keys = response.data.keys;
            const promisses = keys.map(
                async (id: string): Promise<Line> => {
                    const data = await self.getLine(id);
                    return data;
                },
            );

            const arrayPromisses: Array<Promise<Line>> = Array.from(promisses);
            return await Promise.all(arrayPromisses);
        }

        throw new Error();
    }

    public async clear(): Promise<void> {
       await axios.get(
           this.url,
           {
               params: {
                   action: 'deletes',
               },
           },
       );
    }

    public async set(line: Line): Promise<void> {
        const data = line.points.map( (p: Point): object => {
            return [p.x, p.y];
        });
        const points: object[] = Array.from(data);

        const id = uuidv4();
        const value = {
            points,
            createdAt: line.createdAt,
        };

        await axios.get(
            this.url,
            {
                params: {
                    action : 'set',
                    key : id,
                    value,
                },
            },
        );
    }
}
