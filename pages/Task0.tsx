import {FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {useContext, useRef, useState} from "react";
import {
    adaptiveLess,
    degreesToRadians,
    drawArrow,
    drawCircle,
    forTo,
    getRandom,
    range,
    safeToString
} from "../utils/utils";
import {AppContext} from "../colors";
import Canvas from 'react-native-canvas'
import {checkVertices, DFS} from "../utils/graphsUtils";
import AdjacencyMatrix, {aCharCode, AdjacencyMatrixProps} from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import * as fs from "fs";

export default function Task0() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{current: number[][] | null}>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [isEulers, setIsEulers] = useState<boolean>(false);
    const refIsBipartite = useRef<boolean>(false);
    const refCountGraphs = useRef<number>(0);

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);
    }



    function drawCanvas(link:{current: number[][] | null}) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        const checkBipartiteArray:(undefined | boolean)[] = Array(nValue).fill(undefined);
        // let first:boolean | undefined = true
        if(link.current != null) {
            const dfs = new DFS(link.current);
            dfs.start((current, last) => {
                if(last == -1){
                    checkBipartiteArray[current] = true;
                }else{
                    checkBipartiteArray[current] = !checkBipartiteArray[last];
                }
            });
            refCountGraphs.current = dfs.getCountGraphs();

            marker: {
                for (let i = 0; i < nValue; i++) {
                    for (let j = 0; j < nValue; j++) {
                        if (link.current[i][j] === 0)
                            continue;

                        if(checkBipartiteArray[i] == checkBipartiteArray[j]){
                            refIsBipartite.current = false;
                            break marker;
                        }
                    }
                }

                refIsBipartite.current = true;
            }
        }
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
                    <AdjacencyMatrix onChangeMatrix={drawCanvas} vertices={nValue} colorScheme={colorScheme}/>

                    <GraphCanvas getIsEulersAfterRender={setIsEulers} iHateReact={iHateReact} matrix={matrix} vertices={nValue}/>
                </View> : null}

            {matrix.current != null ?
                <View style={[{flexDirection: "column"}]}>
                    <ThemeText style={defaultStyle.marginTopSmall} fontSizeType={FontSizeTypes.normal}>Число компонент связности: {refCountGraphs.current}</ThemeText>
                    <ThemeText style={defaultStyle.marginTopSmall} fontSizeType={FontSizeTypes.normal}>{isEulers ? "Является" : "Не является"} Ейлеровым графом</ThemeText>
                    <ThemeText style={defaultStyle.marginTopSmall} fontSizeType={FontSizeTypes.normal}>{refIsBipartite.current ? "Является" : "Не является"} двудольным графом</ThemeText>
                </View>
                : null
            }
        </Limiter>
    );
}
