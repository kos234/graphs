import {Text, useWindowDimensions, StyleSheet} from "react-native";
import {adaptiveLess} from "../utils/utils";
import {LightMode, AppContext} from "../colors";
import {useContext} from "react";
import {DefaultProps} from "../globalStyles";

export const enum ColorTypes{
    first = "first",
    second = "second",
    hint = "hint",
    error = "error",
    success = "success",
}
export const enum FontSizeTypes{
    big = "big",
    buttonCard = "buttonCard",
    normal = "normal",
    small = "small",
    error = "error",
    sub = "sub"
}

export interface ThemeTextProps extends DefaultProps{
    colorType?: ColorTypes,
    fontSizeType?:FontSizeTypes
}

export const getTextStyle = (colorScheme : typeof LightMode) => {
    return StyleSheet.create({
        text_first:{
            color: colorScheme.textColor,
        },
        text_second:{
            color: colorScheme.secondTextColor,
        },
        text_hint:{
            color: colorScheme.hintTextColor,
        },
        text_error:{
            color: colorScheme.errorColor,
        },
        text_success:{
            color: colorScheme.successColor,
        }
    })
}

export default function ThemeText({colorType, children, style, fontSizeType}:ThemeTextProps){
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const styles = getTextStyle(colorScheme);

    if(colorType == null)
        colorType = ColorTypes.first

    if(fontSizeType == null)
        fontSizeType = FontSizeTypes.normal

    return (
        <Text style={[styles["text_" + colorType], defaultStyle["fontSize_" + fontSizeType], style]}>{children}</Text>
    );
}