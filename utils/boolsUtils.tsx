import Table, {TableColumn, TableRow} from "../components/Table";
import {equalSet, fastParse0or1, forTo, GetArrayReturnType, getRandom, range} from "./utils";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import {FlatList, View} from "react-native";
import {calculateDefaultStyle} from "../globalStyles";
import {LightMode} from "../colors";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {TextStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import {ReactNode} from "react";
import {fastClearArray} from "./useArrayState";

export type UtilsReturn<T> = {
    error: string | undefined,
    value: T
}

//Это 1 задание, получение случайного вектора
export function getRandomVector(argumentCount: number): UtilsReturn<string> {
    const res: UtilsReturn<string> = {error: null, value: ""};
    if (argumentCount > 10) {
        res.error = "Слишком большое значение n!";
        return res;
    }

    for (let i = 0; i < 1 << argumentCount; i++) {
        res.value += Math.floor(getRandom(0, 2));
    }

    return res;
}

//Это проверка пользовательского ввода вектора
export function checkVectorCorrect(rawVector: string): UtilsReturn<{ vector: string, argsCount: number }> {
    const res: UtilsReturn<{ vector: string, argsCount: number }> = {error: null, value: {vector: "", argsCount: 0}};
    res.value.vector = rawVector.replaceAll(/[^01]/g, "");

    vectorManipulation: {
        if (rawVector.length === 0)
            break vectorManipulation;

        res.value.argsCount = Math.log2(rawVector.length);
        if (res.value.argsCount == 0 || res.value.argsCount % 1 !== 0) {
            const lower = 1 << Math.floor(res.value.argsCount);
            if (res.value.argsCount == 0)
                res.error = "Длина вектора должна быть больше 1";
            else
                res.error = "Возможная длина вектора: " + lower + " или " + (lower * 2);
            break vectorManipulation;
        }

    }
    return res;
}

//Это функция для 2 задания, на вход вектора и индексы остаточной, на выходе она отдаёт остаточную
export function getResidualInVector(vector: string, residualIndexes: number[]) {
    let ans = "";
    for (let i = 0; i < residualIndexes.length; i++)
        ans += vector[residualIndexes[i]];
    return ans;
}

//Это функция для 3 задания, на вход нулевая остаточная, единичная остаточная и индексы нулевой остаточной, на выходе склеенная из двух остаточных функция
export function glueVectorOnResiduals(zeroResidual: string, oneResidual: string, zeroResidualIndexes: number[]): string {
    let ans:string = "";
    let zeroCount = 0;
    let oneCount = 0;
    for (let i = 0; i < zeroResidual.length * 2; i++) {
        if (i === zeroResidualIndexes[zeroCount])
            ans += zeroResidual[zeroCount++];
        else
            ans += oneResidual[oneCount++];
    }
    return ans;
}

//Это функция для нахождения остаточной от функции по аргументу
export function getResidualIndexes(vectorLength: number, argument: number, residual: number): number[] {
    if (!vectorLength || !(argument > -1) || !(residual > -1)) //проверка пользовательского ввода
        return [];

    /*
    Я представляю вектор как куски нулевых или единичных остаточных, количество кусков это 2^n
    т.е. для остаточной по первому аргументу будет 2 куска - 00|11, для второго аргумента будет 4 куса - 0|0|1|1 и тд
    Длина 1 куска это длина вектора / куски
    */
    const chunkCount = 1 << argument; //Math.pow(2, n);
    const chunkLength = Math.floor(vectorLength / chunkCount);

    //residual 0 или 1
    let ans:number[] = [];
    for (let chunk = 0; chunk < chunkCount; chunk += 2) { //идём через кусок, т.к. нас интересует либо 0 либо 1 куски
        for (let index = 0; index < chunkLength; index++) {
            ans.push((chunk + residual) * chunkLength + index); //Индекс элемента в остаточной это (чанк + (0 или 1)) * длина + 1, (0 или 1) - это 0 либо 1 остаточная
        }
    }

    return ans;
}

export abstract class BooleanFormat { //Это класс оболочка для ДНФ и КНФ
    //Сколько переменных в ДНФ
    private maxPow: number = 0;

    //ДНФ представляю как массив объектов, в объекте ключ это индекс переменной, а значение показывает отсутствие отрицания над переменной
    //Например, [{1: true, 2:false}, {3:true}] это X1-X2 V x3
    public storage: {
        [key: string]: boolean
    }[] = [];

    public getMaxPow(): number {
        return this.maxPow;
    }

    public calculateMaxPow(currentPow: number): void {
        this.maxPow = Math.max(currentPow, this.maxPow);
    }

    public abstract mainOperation(a: boolean, b: boolean): boolean;

    public abstract innerOperation(a: boolean, b: boolean): boolean;

    public abstract getMainNeutral(): boolean;

    public abstract getInnerNeutral(): boolean;
}

export class DNF extends BooleanFormat {//Реализация ДНФ
    public innerOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

    public mainOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

    public getInnerNeutral(): boolean {
        return true;
    }

    public getMainNeutral(): boolean {
        return false;
    }
}

export class KNF extends BooleanFormat {//Реализация КНФ
    public innerOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

    public mainOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

    public getInnerNeutral(): boolean {
        return false;
    }

    public getMainNeutral(): boolean {
        return true;
    }
}

//Это функция парсинга для 6 и 7 задания
//На вход принимает вектор и то что мы парсим: днф или кнф
export function parseDNF(value: string, isDNF: boolean): UtilsReturn<BooleanFormat> {
    const res: UtilsReturn<BooleanFormat> = {error: null, value: isDNF ? new DNF() : new KNF()};

    markerParse:{
        //Текущее хранилище, то что находится между V и ^ в ДНФ и КНФ
        let currentBooleanFormatElement: (GetArrayReturnType<BooleanFormat["storage"], {}>) = {};
        let lastKey: number | null = null; //Это переменная для последовательного сбора индекса переменной
        let isTrue: boolean = true; //Если ли отрицание
        // Поскольку парсинг идёт последовательно, минус будет считать к предыдущему слагаемому, надо это исправить
        let minusIgnoreCount: -1 | 0 | 1 = 0;
        const flush = () => {//Мы накопили в буфер значения, поэтому нужно сохранить
            minusIgnoreCount--;
            if (lastKey != null)
                currentBooleanFormatElement[lastKey] = minusIgnoreCount === -1 ? isTrue : true
            if (minusIgnoreCount === -1) {
                minusIgnoreCount = 0;
                isTrue = true;
            }
            lastKey = null;
        }

        for (let i = 0; i < value.length; i++) {//Последовательный парсинг
            const currentChar = value[i];
            if (currentChar === "X" || currentChar === "x") {//Если текущий символ х, то мы сохраняем значение прошлого ввода, если конечно до Х не стоит минус
                if (lastKey === 0) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается число, получено "x"`
                    break markerParse;
                }

                flush();//сохраним всё до знака
                lastKey = 0;
            } else if (currentChar >= "1" && currentChar <= "9") {//После ввода Х, ожидается число
                if (lastKey == null) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x", получено число`
                    break markerParse;
                }
                lastKey = lastKey * 10 + parseInt(currentChar);
                res.value.calculateMaxPow(lastKey);
            } else if ((isDNF && (currentChar === "V" || currentChar === "v") || (!isDNF && currentChar == "^"))) {//Это главная или или умножить для ДНФ или КНФ
                if (lastKey == null) {
                    res.error = `Перед знаком ${isDNF ? "V" : "^"} на ${i + 1} позиции должна быть ${isDNF ? "конъюнкция" : "дизъюнкция"}`
                    break markerParse;
                }

                if (lastKey === 0) {
                    res.error = `Перед знаком ${isDNF ? "V" : "^"} на ${i + 1} находится переменная без номера`
                    break markerParse;
                }

                flush();//сохраним всё до знака
                res.value.storage.push(currentBooleanFormatElement);//добавим в массив ДНФ или КНФ хранилище
                currentBooleanFormatElement = {};
            } else if (currentChar === "-") {//Отрицание
                flush();
                if (!isTrue) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x", получено "-"`
                    break markerParse;
                }
                isTrue = false;
                minusIgnoreCount = 1;
            } else if (currentChar === " " || currentChar === "(" || currentChar === ")" || (!isDNF && (currentChar === "V" || currentChar === "v"))) {
                //Можем сколько угодно писать скобки в кнф версии, но нас они интересовать не будут, ибо нам пофиг на приоритет знаков
                //Тоже самое с пробелами
            } else {
                res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x0-9V ", получено "${currentChar}"`
                break markerParse;
            }
            //Ввод работает так, что только знак V или ^ добавляет хранилище ДНФ или КНФ в массив, поэтому после каждого набора переменных (x1x2-x3 например)
            //должен стоять знак V, это проверка именно это и делает
            //Например было x1-x2 V x3, а станет x1-x2 V x3 V
            if (i + 1 === value.length && (lastKey != null || (lastKey == null && !isTrue))) {
                value += " " + (isDNF ? "V" : "^");
            }
        }
    }
    return res;
}

//Это для проверки ДНФ или КНФ. На вход подаётся индекс значения функции, количество аргументов и ДНФ или КНФ
export function getValueINDNF(row: number, n: number, booleanFormat: BooleanFormat): number {
    if (booleanFormat.storage.length === 0)
        return 0;

    let ans = booleanFormat.getMainNeutral();
    for (let q = 0; q < booleanFormat.storage.length; q++) {//Идём по всем хранилищам ДНФ или КНФ
        let currentAns = booleanFormat.getInnerNeutral();
        let currentDNF = booleanFormat.storage[q];
        for (let i = 0; i < n; i++) {//Тупо подставляем туда значения 0 или 1
            if (currentDNF[i + 1] == null)
                continue;
            currentAns = booleanFormat.innerOperation(currentAns, Math.floor((row / (1 << n - i - 1)) % 2) === +currentDNF[i + 1])
        }

        ans = booleanFormat.mainOperation(ans, currentAns)
    }

    return +ans;
}

//Это 8 и 9 задание. На вход вектор, что мы получим днф или кнф и цветовая схема приложения(нужно для отрисовки)
export function getStringBooleanFormatByVector(vector: string, isSDNF: boolean, colorScheme: typeof LightMode) {
    const fontSize = FontSizeTypes.normal;//Это бы удалить, но мне лень
    const ans: ReactNode[] = []
    const n = Math.log2(vector.length);
    for (let row = 0; row < vector.length; row++) {
        if (vector[row] === "1") { //это проверка на то, что по текущему значению функции можно построить СДНФ или СКНФ, иначе скип
            if (!isSDNF)
                continue;
        } else {
            if (isSDNF)
                continue;

            ans.push(<ThemeText fontSizeType={fontSize}>(</ThemeText>);
        }

        for (let i = 0; i < n; i++) {
            //Тупо перебор всех вариантов значений, а страшная фигня снизу это тупо красивый вывод для реакта
            //@ts-ignore
            ans.push(
                <View style={{position: "relative", flexDirection: "row"}}>
                    <ThemeText fontSizeType={fontSize}>x<ThemeText fontSizeType={FontSizeTypes.sub}>{(i + 1)}</ThemeText></ThemeText>
                    {Math.floor((row / (1 << n - i - 1)) % 2) !== +isSDNF ?
                        <ThemeText fontSizeType={fontSize} style={{
                            position: "absolute",
                            backgroundColor: colorScheme.textColor,
                            left: 0,
                            right: 5,
                            top: 10,
                            height: 2
                        }}>&nbsp;</ThemeText>
                        : null}
                </View>
            )
            if (i + 1 !== n && !isSDNF) {
                ans.push(<ThemeText fontSizeType={fontSize}>V</ThemeText>)
            }
        }

        if (isSDNF) {
            ans.push(<ThemeText fontSizeType={fontSize}> V </ThemeText>);
        } else {
            ans.push(<ThemeText fontSizeType={fontSize}>)</ThemeText>);
            //@ts-ignore
            ans.push(<ThemeText fontSizeType={fontSize} style={{transform: [{rotate: "180deg"}]}}> V </ThemeText>);
        }
    }

    ans.splice(ans.length - 1, 1);
    return ans;
}

export class ArgumentIndex {//Это класс с инструментами для 10 - 12 задач
    //Условимся, что f(011) = 1, где 011 это НАБОР аргументов
    //Набор можно представить как число в двоичной записи, например 011(2) = 3(10)

    //В 12 задаче куча Map, масок и тд, сохраняются они в строку, а эта функция достаёт их от туда, причём 9 считается за прочерк (см лекцию минизация Мак-Классики)
    public static parseString(matrix: string): number[] {
        return matrix.split("").map(fastParse0or1)
    }

    //Проверка эквивалентности двух булевых наборов с учётом маски штрих(9)
    public static equal(first: number[], second: number[]): boolean {
        if (first.length != second.length)
            return false;

        let isEqual = true;
        for (let i = 0; i < first.length && isEqual; i++) {
            if (first[i] === 9 || second[i] === 9)
                continue;

            isEqual &&= first[i] === second[i];
        }

        return isEqual;
    }

    //Представить число как двоичный набор
    public static toMatrixIndex(index: number, n: number):number[] {
        const ans: number[] = Array(n).fill(0);

        for (let write = n - 1; index !== 0; write--) {
            ans[write] = index & 1; //Достаём последний бит числа N раз
            index >>= 1;
        }

        return ans;
    }

    //Представить набор как число
    public static toNumberIndex(indexes: number[]): number {
        let ans: number = 0;
        for (let i = 0; i < indexes.length; i++) {
            ans = (ans << 1) | indexes[i]
        }

        return ans;
    }

    //Для проверки монотонности и тд есть необходимость проверить соседей, но зачем проверять что-то по два раза?
    //Поэтому будет только перебор больших соседей, например наборы 000, 001 и 011. Для набора 000 мы проверим соседа 001, а для 001 не будем проверять 000, только 011
    public static getBigNeighbors(indexes: number[]): { differentIndex: number, value: number[] }[] {
        let ans: { differentIndex: number, value: number[] }[] = [];
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i] !== 0)
                continue;
            ans.push(
                {
                    differentIndex: i,
                    //Тут мы просто вырезаем текущую переменную и заменяем её на 1
                    value: [
                        ...indexes.slice(0, i), //Это оператор spread, это фигня тупо выкидывет из массива элементы так, как будто мы их написали ручками
                        1,
                        ...indexes.slice(i + 1, indexes.length)
                    ]
                }
            )
        }

        return ans;
    }
}

//Это задача 10
export function checkPreFullClases(vector: string): { t0: boolean, t1: boolean, s: boolean, l: boolean, m: boolean } {
    const res = {t0: true, t1: true, s: true, l: true, m: true};
    const n = Math.log2(vector.length);
    res.t0 = vector[0] === "0"; //Ну это база
    res.t1 = vector[vector.length - 1] === "1";//Ну это база

    // Проверка самодвойственности, ну тоже дефолт
    for (let i = 0; i < vector.length / 2; i++) {
        if (vector[i] === vector[vector.length - 1 - i]) {
            res.s = false;
            break;
        }
    }
    // end

    // Проверка монотонности. Меньшему соседу ставится <= аргумент
    for (let i = 0; i < vector.length; i++) {
        const checkMatrix = ArgumentIndex.getBigNeighbors(ArgumentIndex.toMatrixIndex(i, n)); //Это индекс в набор, а потом его больших соседей

        for (let q = 0; q < checkMatrix.length; q++) {
            //Можно как строки проверить, но я не доверяю JS
            if (fastParse0or1(vector[i]) > fastParse0or1(vector[ArgumentIndex.toNumberIndex(checkMatrix[q].value)])) {
                res.m = false;
                break;// checkM;
            }
        }
    }
    // end

    // Проверка на линейность, эта фигня строит полином Жегалкина как мы делали, но треугольник не уплывает вниз, а всегда прижат к верхней линии
    const arrLinear: number[][] = [];

    for (let i = 0; i < vector.length; i++) {
        arrLinear.push([])
        for (let q = 0; q < vector.length - i; q++) {
            if (i === 0) {//Первый проход тупо загнать вектор значений
                arrLinear[i].push(fastParse0or1(vector[q]));
            } else {//А это уже тоже самое что мы делали на паре, сравнивали два элемента через +
                arrLinear[i].push(+(arrLinear[i - 1][q] !== arrLinear[i - 1][q + 1]));
            }
        }
    }

    for (let i = 0; i < vector.length; i++) {//На парах мы смотрели по диагонали, а тут по верхней линии
        //Короче если тут стоит 1, значит дальше мы смотрим какие переменные принимают 1, чтобы записать их в полиноме
        //log2 мы получаем то, сколько переменных принимают 1 в текущем наборе. Если непонятно почему это работает, посмотрите как я представил число в виде набора и наоборот в ArgumentIndex
        if (arrLinear[i][0] === 1 && !Number.isInteger(Math.log2(i))) {
            res.l = false;
            break;// checkL;
        }
    }
    // end


    return res;
}

//12 задача
export function getMinDNFByMaxClass(vector: string, colorScheme: typeof LightMode): UtilsReturn<ReactNode[]> {
    const res: UtilsReturn<ReactNode[]> = {error: null, value: []};
    const n = Math.log2(vector.length);

    markerCalc:{
        const mapOnes: Map<number, string[]> = new Map<number, string[]>(); //Карта конечных масок
        let dataUsageMasks: Map<string, number> = new Map<string, number>(); //Карта использований масок
        for (let i = 0; i < vector.length; i++) {//Запоминаем все 1
            if (vector[i] === "1") {
                dataUsageMasks.set(ArgumentIndex.toMatrixIndex(i, n).join(""), 0)
                mapOnes.set(i, []);
            }
        }

        if (dataUsageMasks.size === 0) {//Если 1 нет, то и ДНФ нет
            res.error = "Функция никогда не равна 1, невозможно построить ДНФ!";
            break markerCalc;
        }
        while (true) { //Склеиваем все маски по это возможно
            const localSet: Set<string> = new Set<string>(Array.from(dataUsageMasks.keys()));//Добавим в сет сразу всё, чтобы если что-то не склеилось, то оно всё равно осталось

            for (let [value] of dataUsageMasks) {//Перебираем всё маски. [value] - тоже оператор Spread, кстати
                console.log("search", value);
                ArgumentIndex.getBigNeighbors(ArgumentIndex.parseString(value)).forEach(wrapper => {//Ищём соседей
                    console.log("big neig", wrapper.value, "has", dataUsageMasks.has(wrapper.value.join("")));
                    if (dataUsageMasks.has(wrapper.value.join(""))) {//Проверка если ли такая маска
                        localSet.add([ //Склеиваем
                            ...wrapper.value.slice(0, wrapper.differentIndex),
                            9, //А это типа штрих (см минимизация Мак-Классики
                            ...wrapper.value.slice(wrapper.differentIndex + 1, wrapper.value.length)
                        ].join(""));

                        localSet.delete(value); //удаляем из сета то из чего склеивали
                        localSet.delete(wrapper.value.join(""));
                    }
                });
            }

            console.log("localSet", localSet);
            if(!equalSet(localSet, dataUsageMasks.keys()))//Если что-то склеили то обновляем
                dataUsageMasks = new Map<string, number>(Array.from(localSet, (item) => [item, 0]));
            else //Иначе выходим
                break;
        }

        console.log("dataUsageMasks", dataUsageMasks);

        for (let [keyAns] of mapOnes) { //подсчитываем использование каждой маски
            for (let [value] of dataUsageMasks) { //Перебираем все наборы на которых функция возвращает 1
                if (ArgumentIndex.equal(ArgumentIndex.toMatrixIndex(keyAns, n), ArgumentIndex.parseString(value))) {
                    mapOnes.get(keyAns).push(value);
                    dataUsageMasks.set(value, dataUsageMasks.get(value) + 1)
                }
            }
        }

        let ansArray: string[] = []; //массив днф масок для ответа

        while (mapOnes.size != 0) {//Просеиваем днф маски и выбираем минимально необходимые

            //Находим маски с максимальным использованием
            let maxUsage = Number.MIN_SAFE_INTEGER;
            let maxUsageKey: string[] = [];
            for (let [maksValue, maskUsage] of dataUsageMasks) {
                if (maxUsage < maskUsage) {
                    maxUsage = maskUsage;
                    fastClearArray(maxUsageKey);
                    maxUsageKey.push(maksValue);
                } else if (maxUsage === maskUsage)
                    maxUsageKey.push(maksValue);
            }
            //-----------------------------------------------------------------------------------

            //Выбираем маску, которую добавим в днф
            let deleteMask = maxUsageKey[0]; //По умолчанию первая маска из максимальных
            for (let i = 0; i < maxUsageKey.length - 1; i++) {//Находим маску, которая имеет 0 пересечений с другими, в противном случае без разницы какую маску использовать
                markerEqual: {
                    for (let q = i + 1; q < maxUsageKey.length; q++) {
                        for (let [keyOne, valueOne] of mapOnes) {
                            //Оставляем только маски i и q среди набора keyOne на котором функция возвращает 1
                            //Если есть все 2, то это пересечение и это бе
                            if (valueOne.filter(item => item === maxUsageKey[i] || item === maxUsageKey[q]).length === 2) { //фильтруем маски
                                break markerEqual;
                            }
                        }
                    }
                    deleteMask = maxUsageKey[i];
                    break;
                }
            }
            //-------------------------------------

            ansArray.push(deleteMask); //Добавляем днф, которую выбрали

            for (let [keyOne, valueOne] of mapOnes) {//Перебираем все наборы на которых функция возвращает 1
                const indexDeleteMask = valueOne.indexOf(deleteMask);
                // console.log("find", masksForDelete, "index", indexDeleteMask);
                if (indexDeleteMask === -1)
                    continue

                //Обновляем количество использований
                for (let i = 0; i < valueOne.length + 1; i++) {
                    const deleteUsageKey = i === 0 ? deleteMask : valueOne[i - 1];
                    const tmpUsage = dataUsageMasks.get(deleteUsageKey);
                    if (tmpUsage === 1)
                        dataUsageMasks.delete(deleteUsageKey)
                    else
                        dataUsageMasks.set(deleteUsageKey, tmpUsage - 1);
                }

                //Удаляем все наборы, которые закрывает маска
                mapOnes.delete(keyOne)
            }
        }

        //Строим красивую днф из масок
        for (let i = 0; i < ansArray.length; i++) {
            const currentMask = ansArray[i];

            for (let q = 0; q < currentMask.length; q++) {
                if (currentMask[q] === "9")
                    continue;

                res.value.push(
                    <View key={"x" + i + "" + q} style={{position: "relative"}}>
                        <ThemeText>x<ThemeText fontSizeType={FontSizeTypes.sub}>{(q + 1)}</ThemeText></ThemeText>
                        {currentMask[q] === "0" ?
                            <ThemeText fontSizeType={FontSizeTypes.normal} style={{
                                position: "absolute",
                                backgroundColor: colorScheme.textColor,
                                left: 3,
                                right: 3,
                                top: 10,
                                height: 2
                            }}>&nbsp;</ThemeText>
                            : null}
                    </View>
                )
            }
            if (i + 1 != ansArray.length)
                res.value.push(<ThemeText key={"v" + i} fontSizeType={FontSizeTypes.normal}> V </ThemeText>)
        }
    }

    return res;
}

//Это просто красиво вывести таблицу значений
export function drawTableBoolFunction(vector: string, defaultStyle: ReturnType<typeof calculateDefaultStyle>,
                                      colorScheme: typeof LightMode, addStyleToText?: (row: number, column: number) => StyleProp<TextStyle> | undefined,
                                      booleanFormat?: BooleanFormat) {
    //НЕ ЛЕЗЬ - ОНА ТЕБЯ СОЖРЁТ!!
    const n = Math.log2(vector.length);
    if (!addStyleToText)
        addStyleToText = (row, column) => {
            return undefined
        };
    return (
        <Table style={[defaultStyle.marginTopSmall, {flex: 1}]}>
            <TableRow style={{borderBottomWidth: 2, borderBottomColor: colorScheme.textColor}}>
                {forTo(n, (index) => (
                    <TableColumn style={{justifyContent: "center"}} key={"header" + index}>
                        <ThemeText fontSizeType={FontSizeTypes.normal}
                                   style={[{textAlign: "center"}, addStyleToText(0, index)]}>
                            x<ThemeText fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText>
                        </ThemeText>
                    </TableColumn>
                ))}
                <TableColumn
                    style={[{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}, addStyleToText(0, n)]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal} style={{textAlign: "center"}}>f</ThemeText>
                </TableColumn>

                {booleanFormat ?
                    <TableColumn
                        style={[{
                            borderLeftWidth: 2,
                            borderLeftColor: colorScheme.textColor
                        }, addStyleToText(0, n), {width: 80}]}>
                        <ThemeText fontSizeType={FontSizeTypes.normal} style={{textAlign: "center"}}>{booleanFormat.mainOperation(true, false) ? "ДНФ" : "КНФ"}</ThemeText>
                    </TableColumn> : null
                }
            </TableRow>

            <FlatList
                data={range(1 << n)}

                renderItem={({item}) => {
                    let booleanFormatValue: number | null = booleanFormat ? getValueINDNF(item, n, booleanFormat) : null;

                    return (
                        <TableRow key={"row" + item}>
                            {forTo(n, (num) => (
                                <TableColumn key={"column" + item + "_" + num}>
                                    <ThemeText fontSizeType={FontSizeTypes.normal}
                                               style={[{textAlign: "center"}, addStyleToText(item + 1, num)]}>{Math.floor((item / (1 << n - num - 1)) % 2)}</ThemeText>
                                </TableColumn>
                            ))}
                            <TableColumn style={{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}}>
                                <ThemeText fontSizeType={FontSizeTypes.normal}
                                           style={[{textAlign: "center"}, addStyleToText(item + 1, n)]}>{vector ? vector[item] : ""}</ThemeText>
                            </TableColumn>

                            {booleanFormat ?
                                <TableColumn
                                    style={[{
                                        borderLeftWidth: 2,
                                        borderLeftColor: colorScheme.textColor,
                                    }, addStyleToText(0, n), {width: 80}]}>
                                    <ThemeText fontSizeType={FontSizeTypes.normal}
                                               colorType={vector[item] === booleanFormatValue + "" ? ColorTypes.first : ColorTypes.error}
                                               style={{textAlign: "center"}}>{booleanFormatValue}</ThemeText>
                                </TableColumn>
                                : null
                            }
                        </TableRow>
                    )
                }
                }
            >

            </FlatList>
        </Table>
    )
}
