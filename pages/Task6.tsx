import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {BFS, checkVertices, FSPath} from "../utils/graphsUtils";
import AdjacencyMatrix from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";

export default function Task6() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);
    const [runAnimation, setRunAnimation] = useState<boolean>(false);
    const [userCountGraphs, setUserCountGraphs] = useState<number>(null);
    const refDFSPath = useRef<FSPath[]>([]);
    const refCountGraphs = useRef<number>(0);
    const refEqual = useRef<{color: ColorTypes, value:string }>(null);

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);

        refDFSPath.current = [];
        setRunAnimation(false);
        setMatrix({current: null});
        setIHateReact(!iHateReact);
    }


    function drawCanvas(link: { current: number[][] | null }) {
        setMatrix(link);
        setIHateReact(!iHateReact);
        fastClearArray(refDFSPath);
        setRunAnimation(false);
        if (link.current != null) {
            const bfs = new BFS(link.current);
            bfs.start();
            refCountGraphs.current = bfs.getCountGraphs();
            refDFSPath.current = bfs.getPath();
        }
    }

    function onInputUserCountGraphs(value:string){
        setUserCountGraphs(parseInt(value));
    }

    function onClick() {
        if(userCountGraphs == null || isNaN(userCountGraphs)){
            refEqual.current = {color: ColorTypes.error, value: "Введите число компонент связности"};
            return;
        }

        if(userCountGraphs === refCountGraphs.current){
            refEqual.current = {color: ColorTypes.success, value: "Правильно!"};
        }else{
            refEqual.current = {color: ColorTypes.error, value: "Неправильно! Число компонент связности: " + refCountGraphs.current};
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
                        {refDFSPath.current.length != 0 ?
                            <>
                                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                                    <ThemeText fontSizeType={FontSizeTypes.normal}>Число компонент связности:  </ThemeText>
                                    <ThemeInput
                                        style={{
                                            flex: adaptiveLess(width, 0, {"478": 1}),
                                            width: adaptiveLess(width, null, {"478": 2})
                                        }}
                                        value={safeToString(userCountGraphs)} onInput={onInputUserCountGraphs} typeInput={"numeric"} placeholder={"число"}
                                        fontSizeType={FontSizeTypes.normal}/>
                                </View>
                                <TouchableOpacity onPress={onClick} style={[defaultStyle.marginTopNormal, {
                                    backgroundColor: colorScheme.accentBackground,
                                    padding: 10,
                                    borderRadius: 10
                                }]}>
                                    <ThemeText fontSizeType={FontSizeTypes.error}
                                               style={{color: colorScheme.accentTextColor}}>{runAnimation ? "Остановить анимацию" : "Проверить"}</ThemeText>
                                </TouchableOpacity>
                                {refEqual.current ? <View style={defaultStyle.marginTopSmall}>
                                        <ThemeText colorType={refEqual.current.color}
                                                   fontSizeType={FontSizeTypes.error}>{refEqual.current.value}</ThemeText>
                                    </View>
                                    :null}
                            </>
                            : null}
                    </View>

                    <GraphCanvas onStopAnimation={() => setRunAnimation(false)} runAnimation={runAnimation} animationPath={refDFSPath.current} iHateReact={iHateReact}
                                 matrix={matrix} vertices={nValue}/>
                </View> : null}
        </Limiter>
    );
}
