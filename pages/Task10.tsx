import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {BFS, checkVertices, encodePrufer, FSPath, getMinimumSpanningTree, getMinPaths} from "../utils/graphsUtils";
import AdjacencyMatrix from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";

export default function Task10() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [codePruferData, setCodePruferData] = useState<{error: string, value: string}>(null);

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        setMatrix({current: null});
        setIHateReact(!iHateReact);
        setCodePruferData(null);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        setCodePruferData(link.current ? encodePrufer(link.current) : null);
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

                        {codePruferData != null && codePruferData.error != null ?
                            <View style={defaultStyle.marginTopSmall}>
                            <ThemeText colorType={ColorTypes.error}
                                       fontSizeType={FontSizeTypes.error}>{codePruferData.error}</ThemeText>
                        </View> : null}

                        {
                            codePruferData != null && codePruferData.error == null ?
                                <>
                                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "column"}]}>
                                        <ThemeText fontSizeType={FontSizeTypes.normal}>Код Прюфера: {codePruferData.value}</ThemeText>
                                    </View>
                                </>
                                : null
                        }
                    </View>

                    <GraphCanvas iHateReact={iHateReact} matrix={matrix} vertices={nValue}/>
                </View> : null}
        </Limiter>
    );
}
