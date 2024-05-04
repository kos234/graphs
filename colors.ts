import React, {useRef} from "react";
import {calculateDefaultStyle} from "./globalStyles";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";

export const LightMode = {
    backgroundColor: "#f2f2f2",
    cardColor: "#ffffff",
    textColor: "black",
    secondTextColor: "#737373",
    hintTextColor: "#9e9e9e",
    statusBarStyle: "dark",
    shadowColor: "#000",
    outlineColor: "#D8D8D8",
    errorColor: "red",
    successColor: "green",
    borderColor: "black",
    scrollBarBackground: "#f9f9fd",
    scrollBarColor: "#cecece",
    hoverColor: "#d2d3d3",
    accentBackground: "#3F73EDFF",
    accentTextColor: "white",
};
export const DarkMode = {
    backgroundColor: "#0e0e0e",
    cardColor: "#19191a",
    textColor: "#ffffff",
    secondTextColor: "#e1e3e6",
    hintTextColor: "#9b9b9b",
    statusBarStyle: "light",
    shadowColor: "null",
    outlineColor: "null",
    errorColor: "#e64646",
    successColor: "green",
    borderColor: "white",
    scrollBarBackground: "#2c3031",
    scrollBarColor: "#6e767b",
    hoverColor: "#1d1d1d",
    accentBackground: "rgb(0 37 125)",
    accentTextColor: "white",
};



export const AppContext = React.createContext(
    {
        colorScheme: LightMode,
        defaultStyle: calculateDefaultStyle(Number.MAX_SAFE_INTEGER),
        subscribeTouchEnd: (handler: (() => void)):void => {},
        unsubscribeTouchEnd: (handler: (() => void)):void => {},
    });
