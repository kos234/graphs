import {Animated, TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {checkVertices, BFS, FSPath} from "../utils/graphsUtils";
import AdjacencyMatrix, {aCharCode} from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";


export default function Task4() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [bypass, setBypass] = useState<string>("");
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [runAnimation, setRunAnimation] = useState<boolean>(false);
    const refDFSPath = useRef<FSPath[]>([]);
    const refResBypass = useRef<{color: ColorTypes, value:string }>(null);

    function onInputBypass(value: string) {
        const isLastSpace = value[value.length - 1] === " ";
        value = value.replaceAll(new RegExp("[^a-" + (String.fromCharCode(aCharCode + nValue - 1)) + "]", "g"), "");
        const dataValue = value.split("");
        if (isLastSpace)
            dataValue.push("");
        value = dataValue.join(" → ");
        setBypass(value);
    }

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        refResBypass.current = null;
        refDFSPath.current = [];
        setRunAnimation(false);
        setBypass("");
        setMatrix({current: null});
        setIHateReact(!iHateReact);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        fastClearArray(refDFSPath);
        setRunAnimation(false);
        refResBypass.current = null;
    }

    function onClick() {
        if(bypass.length == 0){
            refResBypass.current = {color: ColorTypes.error, value: "Введите обход"};
            return;
        }

        if(runAnimation === false) {
            const bfs = new BFS(matrix.current);
            refResBypass.current = {color: ColorTypes.error, value: bfs.validBypass(bypass)};
            if(refResBypass.current.value == null) {
                refResBypass.current = {color: ColorTypes.success, value: "Правильно!"}
            }
            refDFSPath.current = bfs.getPath();
        }

        setRunAnimation(!runAnimation);
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
                        {matrix.current != null ?
                            <>
                                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                                    <ThemeText fontSizeType={FontSizeTypes.normal}>Введите обход: </ThemeText>
                                    <ThemeInput
                                        style={{
                                            flex: adaptiveLess(width, 0, {"478": 1}),
                                            width: adaptiveLess(width, null, {"478": 2})
                                        }}
                                        value={bypass} onInput={onInputBypass} typeInput={"text"} placeholder={"обход"}
                                        fontSizeType={FontSizeTypes.normal}/>
                                </View>
                                <TouchableOpacity onPress={onClick} style={[defaultStyle.marginTopNormal, {
                                    backgroundColor: colorScheme.accentBackground,
                                    padding: 10,
                                    borderRadius: 10
                                }]}>
                                    <ThemeText fontSizeType={FontSizeTypes.error}
                                               style={{color: colorScheme.accentTextColor}}>{runAnimation ? "Остановить анимацию" : "Проверить путь"}</ThemeText>
                                </TouchableOpacity>

                                {refResBypass.current ? <View style={defaultStyle.marginTopSmall}>
                                    <ThemeText colorType={refResBypass.current.color}
                                               fontSizeType={FontSizeTypes.error}>{refResBypass.current.value}</ThemeText>
                                </View>
                                :null}
                            </> : null}
                    </View>

                    <GraphCanvas onStopAnimation={() => setRunAnimation(false)} runAnimation={runAnimation} animationPath={refDFSPath.current} iHateReact={iHateReact}
                                 matrix={matrix} vertices={nValue}/>
                </View> : null}
        </Limiter>
    );
}
