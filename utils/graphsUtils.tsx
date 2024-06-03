import {isValidNumber} from "react-native-gesture-handler/lib/typescript/web_hammer/utils";
import {fastClearArray} from "./useArrayState";
import {aCharCode} from "../components/AdjacencyMatrix";
import {binSearch, equalSet} from "./utils";

export type UtilsReturn<T> = {
    error: string | undefined,
    value: T
}

export function cloneMatrix(matrix:number[][]){
    return structuredClone(matrix);
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
            const accessVertex = new Set<number>();
            const visitedVertex = new Set<number>();
            for (let i = 0; i < this.matrix.length; i++) {
                if (this.matrix[node][i] != 0 && !this.visited.has(i)) {
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
                    if (this.checkBypass != null && isCheck) {
                        i = -1;
                    }
                }
            }

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

export function getMinimumSpanningTree(matrix:number[][]){
    const tmpMatrix:number[][] = [];
    for(let i = 0; i < matrix.length; i++){
        tmpMatrix.push(Array<0>(matrix.length).fill(0));
    }
    const ribs:{first:number, second:number, weight:number}[] = [];

    for(let i = 0; i < matrix.length - 1; i++){
        for(let q = i + 1; q < matrix.length; q++){
            if(matrix[i][q] != 0){
                ribs.push({first: i, second: q, weight: matrix[i][q]});
            }
        }
    }

    ribs.sort((a, b) => a.weight - b.weight);

    let graphs = matrix.length;
    for (let i = 0; graphs != 1; i++){
        tmpMatrix[ribs[i].first][ribs[i].second] = ribs[i].weight;
        tmpMatrix[ribs[i].second][ribs[i].first] = ribs[i].weight;

        const dfs = new DFS(tmpMatrix);
        dfs.start();
        let tmpGraphs = dfs.getCountGraphs();
        if(tmpGraphs === graphs){
            tmpMatrix[ribs[i].first][ribs[i].second] = 0;
            tmpMatrix[ribs[i].second][ribs[i].first] = 0;
        }else{
            graphs = tmpGraphs;
        }
    }

    return tmpMatrix;
}

export function getMinPaths(matrix:number[][]):UtilsReturn<{minPaths:number[][], availableMatrix:number[][]}>{
    const res:UtilsReturn<{minPaths:number[][], availableMatrix:number[][]}> = {
        error: undefined,
        value: {
            availableMatrix: [],
            minPaths: [],
        }
    }

    for(let i = 0; i < matrix.length; i++){
        res.value.availableMatrix.push(Array(matrix.length).fill(0));
        res.value.minPaths.push(Array(matrix.length).fill(0));
        for(let j = 0; j < matrix.length; j++){
            res.value.minPaths[i][j] = matrix[i][j];

            if(i === j || matrix[i][j] != 0){
                res.value.availableMatrix[i][j] = j;
            }else{
                res.value.minPaths[i][j] = Number.MAX_SAFE_INTEGER;
                res.value.availableMatrix[i][j] = Number.MAX_SAFE_INTEGER;
            }
        }
    }

    for(let i = 0; i < res.value.minPaths.length; i++){
        for(let start = 0; start < res.value.minPaths.length; start++){
            for(let end = 0; end < res.value.minPaths.length; end ++){
                if(res.value.minPaths[start][i] + res.value.minPaths[i][end] < res.value.minPaths[start][end]){
                    res.value.minPaths[start][end] = res.value.minPaths[start][i] + res.value.minPaths[i][end];
                    res.value.availableMatrix[start][end] = i;
                }
            }
        }
    }

    return res;
}

export function encodePrufer(linkToMatrix:number[][]):UtilsReturn<string>{
    const matrix = cloneMatrix(linkToMatrix);
    const res:UtilsReturn<string> = {error: undefined, value: ""};
    while (true){
        let isAddCharToCode = false;
        for(let i = 0; i < matrix.length; i++){
            marker: {
                let indexVertices = -1;
                for (let j = 0; j < matrix.length; j++) {
                    if (matrix[i][j] != 0) {
                        if (indexVertices === -1)
                            indexVertices = j;
                        else {
                            break marker;
                        }
                    }
                }
                if(indexVertices === -1)
                    break marker;

                matrix[i][indexVertices] = 0;
                matrix[indexVertices][i] = 0;
                res.value += String.fromCharCode(aCharCode + indexVertices);
                isAddCharToCode = true;
                break;
            }
        }

        if(matrix.length - res.value.length === 2)
            break;

        if(isAddCharToCode)
            continue;

        res.error = "Граф не является деревом";
        break;
    }

    return res;
}

export function decodePrufer(code:string, verticiesCount:number):UtilsReturn<number[][]>{
    const res:UtilsReturn<number[][]> = {error: undefined, value: []};
    for (let i = 0; i < verticiesCount; i++){
        res.value.push(Array(verticiesCount).fill(0));
    }

    const twoWord:number[] = [];
    let offset = 0;
    for(let i = 0; i < verticiesCount; i++){
        let numberFromCode:number;
        offset--;
        do{
            offset++;
            numberFromCode = code.charCodeAt(offset) - aCharCode;
        }while (numberFromCode < i && offset + 1 < code.length)

        if(numberFromCode == i){
            continue;
        }

        twoWord.push(i);
    }

    if(twoWord.length === 0){
        res.error = "Неверный код! Все вершины дерева присутствуют в коде";
        return res;
    }

    while (code.length !== 0 || twoWord.length !== 0){
        if(code.length !== 0) {
            let rawNumberFromCode = code[0];
            let numberFromCode = code.charCodeAt(0) - aCharCode;

            res.value[twoWord[0]][numberFromCode] = 1;
            res.value[numberFromCode][twoWord[0]] = 1;
            twoWord.shift();
            code = code.substring(1);
            if(code.indexOf(rawNumberFromCode) == -1)
                twoWord.splice(binSearch<number>(numberFromCode, twoWord, (a, b) => a - b), 0, numberFromCode);
        }else if(twoWord.length === 1){
            res.error = "Неверный код Прюфера!";
            break;
        }else{
            res.value[twoWord[0]][twoWord[1]] = 1;
            res.value[twoWord[1]][twoWord[0]] = 1;
            twoWord.shift();
            twoWord.shift();
        }
    }

    return res;
}

export function colorGraph(matrix:number[][]):number[]{
    let colorCount = 1;
    const colors:number[] = Array(matrix.length).fill(0);

    const checkCorrectColored = ():boolean => {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
                if(matrix[i][j] != 0 && colors[i] === colors[j])
                    return false;
            }
        }
        return true;
    }

    while (true){
        if(checkCorrectColored()){
            break;
        }

        marker: {
            for (let i = matrix.length - 1; i >= 0; i--) {
                if (colors[i] + 1 < colorCount) {
                    colors[i] += 1;
                    break marker;
                } else
                    colors[i] = 0
            }

            colorCount++;
        }
    }
    return colors;
}
