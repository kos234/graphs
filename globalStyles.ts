import {StyleProp, StyleSheet, TextStyle, ViewStyle} from "react-native";
import {adaptiveLess} from "./utils/utils";
import {FontSizeTypes} from "./components/ThemeText";
import {ViewProps} from "react-native/Libraries/Components/View/ViewPropTypes";

export interface DefaultProps{
    style?:StyleProp<ViewStyle> | StyleProp<TextStyle>,
    children?:any,
}
export function calculateDefaultStyle(width:number){
    const fontSizeSmall = adaptiveLess(width, 18, {"800": 16}); //main
    const fontSizeBig = fontSizeSmall * 9/4;
    const fontSizeNormal=  fontSizeSmall * 3/2;
    const fontSizeSub = fontSizeSmall * 5/6;
    const fontSizeHeaderTitle = fontSizeSmall * 7/6;

    return StyleSheet.create({
        //Margins
        //{"1270": 15, "1048": 15, "700": 15}
        marginTopNormal:{
            marginTop: adaptiveLess(width, 20, {}),
        },
        marginTopSmall:{
            marginTop: adaptiveLess(width, 10, {})
        },

        //Размер текста
        fontSize_big:{
            fontSize: fontSizeBig,
            lineHeight: fontSizeBig * 1.5,
        },
        fontSize_buttonCard:{
            fontSize: adaptiveLess(width, fontSizeSmall, {"800": fontSizeHeaderTitle}),
            lineHeight: adaptiveLess(width, fontSizeSmall, {"800": fontSizeHeaderTitle}) * 1.5,
        },
        fontSize_normal:{
            fontSize: fontSizeNormal,
            lineHeight: fontSizeNormal * 1.5,
        },
        fontSize_small:{
            fontSize: fontSizeSmall,
            lineHeight: fontSizeSmall * 1.5,
        },
        fontSize_error:{
            fontSize: fontSizeSmall,
            lineHeight: fontSizeSmall * 1.5,
        },
        fontSize_sub:{
            fontSize: fontSizeSub,
        },
        fontSize_title:{
            fontSize: fontSizeHeaderTitle,
            lineHeight: fontSizeHeaderTitle * 1.5,
            //@ts-ignore
            themeIconSize: adaptiveLess(width, 30, {"425": 21}),
            //@ts-ignore
            backIconSize: adaptiveLess(width, 25, {"425": 21}),
            //@ts-ignore
            headerHeight: adaptiveLess(width, 63, {"425": 54}),
        },
    });
}