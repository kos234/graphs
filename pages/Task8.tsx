import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, range, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {BFS, checkVertices, FSPath, getMinimumSpanningTree, getMinPaths} from "../utils/graphsUtils";
import AdjacencyMatrix, {aCharCode} from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";
import DropDown from "../components/DropDown";

export default function Task8() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [minPathsData, setMinPathsData] = useState<{ minPaths: number[][], availableMatrix: number[][] }>(null);
    const [startVertices, setStartVertices] = useState<number>(null);

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        setMatrix({current: null});
        setIHateReact(!iHateReact);
        setMinPathsData(null);
        setStartVertices(null);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        // console.log(link.current ? link.current.map(i => i.join(", ")) : "null");
        setMatrix(link);
        setIHateReact(!iHateReact);
        setMinPathsData(link.current ? getMinPaths(link.current).value : null);
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
                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", justifyContent: "space-between"}, {zIndex: 4}]}>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "column", alignItems: "flex-start"}, {zIndex: 4}]}>
                        <AdjacencyMatrix onChangeMatrix={drawCanvas} vertices={nValue} colorScheme={colorScheme}/>

                        <View style={[defaultStyle.marginTopNormal, {zIndex: 4}]}>
                            <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите начальную вершину: </ThemeText>
                            <DropDown
                                defaultValue={startVertices != null ?  String.fromCharCode(aCharCode + startVertices) : null}
                                placeholder={"вершина"} style={[defaultStyle.marginTopSmall, {zIndex: 4}]} elements={range(nValue).map(item => ({key: item+"", value: String.fromCharCode(aCharCode + item)}))}
                                      onSelect={dropDown => {
                                          setStartVertices(parseInt(dropDown.key))
                                      }}/>
                        </View>
                    </View>

                    <GraphCanvas iHateReact={iHateReact} matrix={matrix} vertices={nValue}/>
                </View> : null}

            {
                minPathsData != null && startVertices != null ?
                    <>
                        <View style={{flexDirection: "row", gap: defaultStyle.marginTopNormal.marginTop}}>
                            <View style={[defaultStyle.marginTopNormal, {flexDirection: "column"}]}>
                                <ThemeText fontSizeType={FontSizeTypes.normal}>Таблица кратчайших путей</ThemeText>
                                <AdjacencyMatrix drawOnlyThisRow={startVertices} notEditValue={{current: minPathsData.minPaths}} onChangeMatrix={() => {
                                }} vertices={nValue} colorScheme={colorScheme}/>
                            </View>
                        </View>
                    </>
                    : null
            }
        </Limiter>
    );
}
