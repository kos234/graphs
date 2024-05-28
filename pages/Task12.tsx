import {FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {
    adaptiveLess,
    safeToString
} from "../utils/utils";
import {AppContext} from "../colors";
import Canvas from 'react-native-canvas'
import {checkVertices, colorGraph, DFS, FSPath} from "../utils/graphsUtils";
import AdjacencyMatrix, {aCharCode, AdjacencyMatrixProps} from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import * as fs from "fs";
import {fastClearArray} from "../utils/useArrayState";
import Table, {TableColumn, TableRow} from "../components/Table";

export default function Task12() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [coloredGraph, setColoredGraph] = useState<number[]>(null);
    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        setColoredGraph(null);
        setMatrix({current: null});
        setIHateReact(!iHateReact);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        setColoredGraph(null);
        if (link.current != null) {
            setColoredGraph(colorGraph(link.current));
        }
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите количество вершин: </ThemeText>
                <ThemeInput
                    style={{flex: adaptiveLess(width, 0, {"478": 1}), width: adaptiveLess(width, null, {"478": 2})}}
                    value={safeToString(nValue)} onInput={onInputVertices} typeInput={"numeric"} placeholder={"число"}
                    fontSizeType={FontSizeTypes.normal}/>
            </View>

            {error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{error}</ThemeText>
            </View> : null}

            {!error && nValue ?
                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", justifyContent: "space-between"}]}>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "column", alignItems: "flex-start"}]}>
                        <AdjacencyMatrix onChangeMatrix={drawCanvas} vertices={nValue} colorScheme={colorScheme}/>
                    </View>

                    <GraphCanvas colorGraphs={coloredGraph} iHateReact={iHateReact}
                                 matrix={matrix} vertices={nValue}/>
                </View> : null}
        </Limiter>
    );
}
