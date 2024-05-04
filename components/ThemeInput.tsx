import {useWindowDimensions, StyleSheet, TextInput, Platform, InputModeOptions} from "react-native";
import {AppContext} from "../colors";
import {useContext, useState} from "react";
import {ColorTypes, FontSizeTypes, getTextStyle, ThemeTextProps} from "./ThemeText";
import {KeyboardTypeOptions} from "react-native/Libraries/Components/TextInput/TextInput";
import {NativeSyntheticEvent, NativeTouchEvent} from "react-native/Libraries/Types/CoreEventTypes";

export interface ThemeInputProps extends ThemeTextProps {
    placeholder?: string,
    typeInput?: InputModeOptions | undefined
    value: string,
    onInput: Function,
    notDeleteFirstZero?: boolean
}

export default function ThemeInput({
                                       colorType,
                                       style,
                                       placeholder,
                                       typeInput,
                                       value,
                                       onInput,
                                       fontSizeType,
                                       notDeleteFirstZero
                                   }: ThemeInputProps) {
    const [selection, setSelection] = useState(undefined);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const styles = getTextStyle(colorScheme);

    const textChangeEvent = (text: string): void => {
        let newText = text;
        switch (typeInput) {
            case "numeric":
                newText = text.replaceAll(/[^0-9]/g, "");
                if (!notDeleteFirstZero && newText !== "0")
                    newText = newText.replace(/^0+/, "");

                if (value !== "0")
                    for (let i = 0; i < Math.min(text.length, newText.length); i++) {
                        if (newText[i] !== text[i]) {
                            setSelection({start: i, end: i});
                            break;
                        }
                    }


                break;
        }

        onInput(newText);
    }

    if(colorType == null)
        colorType = ColorTypes.first

    if(fontSizeType == null)
        fontSizeType = FontSizeTypes.normal

    return (
        <TextInput
            selection={selection} value={typeof value !== "string" ? (value + "") : value}
                   onChangeText={textChangeEvent}
                   inputMode={typeInput} placeholderTextColor={colorScheme.hintTextColor} placeholder={placeholder}
                   style={[styles[colorType != null ? "text_" + colorType : "text_first"], {
                       borderBottomColor: colorScheme.secondTextColor,
                       borderBottomWidth: 1,
                   }, Platform.OS === "web" ? {outlineWidth: 0} : {}, defaultStyle["fontSize_" + fontSizeType], style]}/>
    );
}