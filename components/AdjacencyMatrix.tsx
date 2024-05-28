import {DefaultProps} from "../globalStyles";
import useArrayState, {fastClearArray} from "../utils/useArrayState";
import React, {useEffect, useMemo, useRef} from "react";
import {View} from "react-native";
import {range, safeToString} from "../utils/utils";
import Table, {TableColumn, TableRow} from "./Table";
import ThemeInput from "./ThemeInput";
import ThemeText, {FontSizeTypes} from "./ThemeText";
import {LightMode} from "../colors";

export interface AdjacencyMatrixProps extends DefaultProps {
    vertices: number,
    colorScheme: typeof LightMode,
    notEditValue?: { current: number[][] },
    onChangeMatrix: (arrayState: { current: (number | undefined)[][] }) => void
    isAllSymbol?: boolean
    drawOnlyThisRow?: number
}

export const aCharCode: number = "a".charCodeAt(0);
export default function AdjacencyMatrix({
                                            drawOnlyThisRow,
                                            isAllSymbol,
                                            vertices,
                                            colorScheme,
                                            onChangeMatrix,
                                            children,
                                            style,
                                            notEditValue
                                        }: AdjacencyMatrixProps) {
    console.log("notEditValue", notEditValue);
    const [stateArray, setStateArray] = useArrayState<(number | undefined)[]>(
        useMemo<(number | undefined)[][]>(() => {
            console.log("memo", notEditValue);
            if (notEditValue)
                return notEditValue.current;

            let tmp: number[][] = [];
            for (let i = 0; i < vertices; i++) {
                tmp.push(Array<undefined>(vertices).fill(undefined));
            }
            return tmp;
        }, [vertices])
    );

    useEffect(() => {
        if (notEditValue)
            return;

        fastClearArray(stateArray.current);
        for (let i = 0; i < vertices; i++) {
            stateArray.current.push(Array<undefined>(vertices).fill(undefined));
            stateArray.current[i][i] = 0;
        }
        setStateArray();
    }, [vertices]);

    function onInputInMatrix(value: string, row: number, column: number) {
        if (notEditValue)
            return;

        let n = parseInt(value);
        if (isNaN(n))
            n = undefined;

        if (stateArray.current[row][column] === stateArray.current[column][row] && row <= column) {
            stateArray.current[row][column] = n;
            stateArray.current[column][row] = n;
        } else {
            stateArray.current[row][column] = n;
        }

        setStateArray();

        let isFull: boolean = true;
        marker:{
            for (let i = 0; i < vertices; i++) {
                for (let j = 0; j < vertices; j++) {
                    if (stateArray.current[i][j] === undefined) {
                        isFull = false;
                        break marker;
                    }
                }
            }
        }

        onChangeMatrix(isFull ? stateArray : {current: null});
    }

    return (

        <Table>
            {stateArray.current.length === vertices ? range(vertices + 1).map(key => {
                if (key === 0) {
                    return (
                        <TableRow key={key + "row"} style={[{
                            borderBottomWidth: 2,
                            borderTopWidth: 2,
                            borderRightWidth: 2,
                            borderColor: colorScheme.textColor
                        }]}>
                            {range(vertices + 1).map(keyInner => (
                                <TableColumn key={keyInner + "column" + key + "row"}
                                             style={{borderLeftWidth: 2, borderColor: colorScheme.textColor}}>
                                    <ThemeText style={{
                                        textAlign: "center",
                                        fontWeight: "bold"
                                    }}>{keyInner !== 0 ? String.fromCharCode(aCharCode + keyInner - 1) : null}</ThemeText>
                                </TableColumn>
                            ))}
                        </TableRow>
                    )
                }

                if (drawOnlyThisRow == undefined || drawOnlyThisRow == key - 1)
                    return (
                        <TableRow key={key + "row"} style={[{
                            borderBottomWidth: 2,
                            borderRightWidth: 2,
                            borderColor: colorScheme.textColor
                        }]}>
                            {range(vertices + 1).map(keyInner => (
                                <TableColumn key={keyInner + "column" + key + "row"}
                                             style={{borderLeftWidth: 2, borderColor: colorScheme.textColor}}>
                                    {keyInner === 0 ? <ThemeText style={{
                                        textAlign: "center",
                                        fontWeight: "bold"
                                    }}>{String.fromCharCode(aCharCode + key - 1)}</ThemeText> : null}
                                    {keyInner === key ? <ThemeText style={{
                                        textAlign: "center",
                                        fontStyle: "italic"
                                    }}>{isAllSymbol ? String.fromCharCode(aCharCode + keyInner - 1) : 0}</ThemeText> : null}
                                    {keyInner !== 0 && keyInner !== key ?
                                        <ThemeInput allowMinus={true} typeInput={"numeric"}
                                                    style={{textAlign: "center"}}
                                                    onInput={(value) => onInputInMatrix(value, key - 1, keyInner - 1)}
                                                    value={isAllSymbol ? String.fromCharCode(aCharCode + stateArray.current[key - 1][keyInner - 1]) : safeToString(stateArray.current[key - 1][keyInner - 1])}/>
                                        : null}
                                </TableColumn>
                            ))}
                        </TableRow>
                    )
            }) : null}
        </Table>
    );
}
