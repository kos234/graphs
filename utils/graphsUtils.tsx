import {isValidNumber} from "react-native-gesture-handler/lib/typescript/web_hammer/utils";
import {fastClearArray} from "./useArrayState";
import {aCharCode} from "../components/AdjacencyMatrix";
import {equalSet} from "./utils";

export type UtilsReturn<T> = {
    error: string | undefined,
    value: T
}

export function checkVertices(value: string): UtilsReturn<number> {
    const res: UtilsReturn<number> = {error: undefined, value: parseInt(value)};
    if (res.value > 20) {
        res.error = "Слишком большое значение n!";
    }

    return res;
}

export type FSPath = {
    current: number,
    last: number,
    deltaX?: number,
    deltaY?: number,
}

export abstract class FirstSearch {
    matrix: number[][];
    countGraphs: number = 0;
    visited: Set<number> = new Set();
    path: FSPath[] = [];

    checkBypass: string[] = null;
    currentBypass: number = 0;
    resOfBypass: string = null;

    constructor(matrix: number[][]) {
        this.matrix = matrix;
    }

    public getCountGraphs(): number {
        return this.countGraphs;
    }

    public getPath(): FSPath[] {
        console.log("path", this.path)
        return this.path;
    }

    protected abstract local(vertex: number, lastVertex: number, callback?: (current: number, last: number) => void);

    public start(callback?: (current: number, last: number) => void) {
        for (let i = 0; i < this.matrix.length; i++) {
            if (!this.visited.has(i)) {
                console.log("main visit", i)
                this.countGraphs++;
                this.local(i, -1, callback);
            }
        }
    }

    public validBypass(value: string): string {
        fastClearArray(this.path);
        this.visited.clear();
        this.countGraphs = 0;
        this.checkBypass = value.replaceAll(/[^a-z]/g, "").split("");
        this.currentBypass = 0;

        for (let i = 0; i < this.checkBypass.length; i++) {
            if (this.resOfBypass)
                break;

            const numberCode = this.checkBypass[i].charCodeAt(0) - aCharCode;
            console.log("main visit", numberCode);
            if (!this.visited.has(numberCode)) {
                this.countGraphs++;
                this.currentBypass++;
                this.local(numberCode, -1, null);
            }
        }

        if (!this.resOfBypass) {
            for (let i = 0; i < this.matrix.length; i++) {
                if (!this.visited.has(i)) {
                    this.resOfBypass = "Неверный обход! Вы не посетили вершину " + String.fromCharCode(i + aCharCode);
                    break
                }
            }
        }

        return this.resOfBypass;
    }
}

export class BFS extends FirstSearch {
    constructor(matrix: number[][]) {
        super(matrix);
    }

    protected local(vertex: number, lastVertex: number, callback?: (current: number, last: number) => void) {
        if (this.checkBypass != null && this.resOfBypass)
            return;

        this.visited.add(vertex);
        if (callback)
            callback(vertex, lastVertex);

        this.path.push({current: vertex, last: lastVertex});

        const queue = [];
        queue.push(vertex);
        while (queue.length > 0) {
            const node = queue.shift();
            console.log("for", node);
            console.log("visited", Array.from(this.visited.keys()).join(", "));
            const accessVertex = new Set<number>();
            const visitedVertex = new Set<number>();
            for (let i = 0; i < this.matrix.length; i++) {
                if (this.matrix[node][i] != 0 && !this.visited.has(i)) {
                    console.log("access", i);
                    accessVertex.add(i);
                    let isCheck = false;
                    if (this.checkBypass != null) {
                        if (this.checkBypass[this.currentBypass] === String.fromCharCode(i + aCharCode)) {
                            isCheck = true;
                            this.currentBypass++;
                        }

                        if (!isCheck)
                            continue;
                    }

                    if (callback)
                        callback(i, node);
                    this.path.push({current: i, last: node});
                    queue.push(i);
                    this.visited.add(i);
                    visitedVertex.add(i);
                    if (this.checkBypass != null && isCheck)
                        i = 0;
                }
            }

            console.log()
            if (this.checkBypass && !equalSet(visitedVertex, accessVertex.keys())) {
                this.resOfBypass = "Неверный обход! Вы пошли ни во все дочерние вершины " + String.fromCharCode(node + aCharCode);
            }
        }
    }
}

export class DFS extends FirstSearch {
    constructor(matrix: number[][]) {
        super(matrix);
    }

    protected local(vertex: number, lastVertex: number, callback?: (current: number, last: number) => void) {
        if (this.checkBypass != null && this.resOfBypass)
            return;

        this.visited.add(vertex);
        if (callback)
            callback(vertex, lastVertex);

        this.path.push({current: vertex, last: lastVertex});

        let hasAnyChild = false;
        let startOther = false;
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[vertex][i] != 0 && !this.visited.has(i)) {
                hasAnyChild ||= true;

                let isCheck = false;
                if (this.checkBypass != null) {
                    if (this.checkBypass[this.currentBypass] === String.fromCharCode(i + aCharCode)) {
                        isCheck = true;
                        this.currentBypass++;
                    }

                    if (!isCheck)
                        continue;
                }
                startOther = true;
                this.local(i, vertex, callback);

                if (this.checkBypass != null && isCheck)
                    i = 0;
            }
        }

        if (this.checkBypass && hasAnyChild && !startOther) {
            this.resOfBypass = "Неверный обход! Вы не пошли ни в одну вершину " + String.fromCharCode(vertex + aCharCode);
        }
    }
}
