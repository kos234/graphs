import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {BFS, checkVertices, FSPath, getMinimumSpanningTree, getMinPaths} from "../utils/graphsUtils";
import AdjacencyMatrix from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";

export default function Task9() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [minPathsData, setMinPathsData] = useState<{minPaths:number[][], availableMatrix:number[][]}>(null);

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        setMatrix({current: null});
        setIHateReact(!iHateReact);
        setMinPathsData(null);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        setMinPathsData(link.current ? getMinPaths(link.current).value : null);
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите количество вершин:  </ThemeText>
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

                    <GraphCanvas iHateReact={iHateReact} matrix={matrix} vertices={nValue}/>
                </View> : null}

            {
                minPathsData != null ?
                    <>
                        <View style={{flexDirection: "row", gap: defaultStyle.marginTopNormal.marginTop}}>
                            <View style={[defaultStyle.marginTopNormal, {flexDirection: "column"}]}>
                                <ThemeText fontSizeType={FontSizeTypes.normal}>Матрица кратчайших путей</ThemeText>
                                <AdjacencyMatrix notEditValue={{current: minPathsData.minPaths}} onChangeMatrix={() => {}} vertices={nValue} colorScheme={colorScheme}/>
                            </View>

                            <View style={[defaultStyle.marginTopNormal, {flexDirection: "column"}]}>
                                <ThemeText fontSizeType={FontSizeTypes.normal}>Матрица доступности</ThemeText>
                                <AdjacencyMatrix isAllSymbol={true} notEditValue={{current: minPathsData.availableMatrix}} onChangeMatrix={() => {}} vertices={nValue} colorScheme={colorScheme}/>
                            </View>
                        </View>
                    </>
                    : null
            }
        </Limiter>
    );
}
