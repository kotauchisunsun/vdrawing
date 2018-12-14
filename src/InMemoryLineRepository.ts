import LineRepositoryInterface from './LineRepositoryInterface';
import Line from './Line';

export default class InMemoryLineRepository implements LineRepositoryInterface {
    private data: Line[];

    public constructor() {
        this.data = [];
    }

    public async gets(): Promise<Line[]> {
        return this.data;
    }

    public async clear(): Promise<void> {
        this.data.splice(0, this.data.length);
    }

    public async set(line: Line): Promise<void> {
        this.data.push(line);
    }
}
