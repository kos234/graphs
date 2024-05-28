import {Animated, TouchableOpacity, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import React, {useContext, useRef, useState} from "react";
import {adaptiveLess, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import {checkVertices, decodePrufer, DFS, FSPath} from "../utils/graphsUtils";
import AdjacencyMatrix, {aCharCode} from "../components/AdjacencyMatrix";
import GraphCanvas from "../components/GraphCanvas";
import {fastClearArray} from "../utils/useArrayState";


export default function Task11() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [codePruferError, setCodePruferError] = useState<string>(null);
    const [codePruferRaw, setCodePruferRaw] = useState<string>("");
    const [error, setError] = useState(null);
    const [matrix, setMatrix] = useState<{ current: number[][] | null }>({current: null});
    const [iHateReact, setIHateReact] = useState<boolean>(false);

    function onInputCodePrufer(value: string) {
        value = value.replaceAll(new RegExp("[^a-" + (String.fromCharCode(aCharCode + nValue - 1)) + "]", "g"), "");
        const data = (decodePrufer(value, nValue));
        console.log(data);
        setCodePruferRaw(value);
        setMatrix({current: null});
        setCodePruferError(data.error)
        if (!data.error) {
            setMatrix({current: data.value});
        }

        setIHateReact(!iHateReact);
    }

    function onInputVertices(value: string) {
        const res = checkVertices(value);
        setError(res.error);
        setNValue(res.value);
        setCodePruferRaw("");
        setCodePruferError(null);
        setMatrix({current: null});
        setIHateReact(!iHateReact);
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
                <>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                        <ThemeText fontSizeType={FontSizeTypes.normal}>Введите код Прюфера:  </ThemeText>
                        <ThemeInput
                            style={{
                                flex: adaptiveLess(width, 0, {"478": 1}),
                                width: adaptiveLess(width, null, {"478": 2})
                            }}
                            value={codePruferRaw} onInput={onInputCodePrufer} typeInput={"text"} placeholder={"код"}
                            fontSizeType={FontSizeTypes.normal}/>
                    </View>

                    {codePruferError ? <View style={defaultStyle.marginTopSmall}>
                        <ThemeText colorType={ColorTypes.error}
                                   fontSizeType={FontSizeTypes.error}>{codePruferError}</ThemeText>
                    </View> : null}

                    {matrix.current != null ?
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", justifyContent: "space-between"}]}>
                        <View style={[defaultStyle.marginTopNormal, {flexDirection: "column", alignItems: "flex-start"}]}>
                            <AdjacencyMatrix notEditValue={matrix} onChangeMatrix={() => {}} vertices={nValue} colorScheme={colorScheme}/>
                        </View>

                        <GraphCanvas iHateReact={iHateReact} matrix={matrix} vertices={nValue}/>
                    </View>
                        : null}
                </>
                : null}
        </Limiter>
    );
}
