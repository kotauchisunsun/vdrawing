import Line from './Line';

export default interface LineRepositoryInterface {
    gets(): Promise<Line[]>;
    clear(): Promise<void>;
    set(l: Line): Promise<void>;
}
