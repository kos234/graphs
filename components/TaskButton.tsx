import {StyleSheet, useWindowDimensions, View} from "react-native";
import {adaptiveLess} from "../utils/utils";
import {useContext} from "react";
import {AppContext} from "../colors";
import ThemeText, {FontSizeTypes} from "./ThemeText";
import {Link, useNavigation} from "@react-navigation/native";
import {getLinking} from "../contents";
import {DefaultProps} from "../globalStyles";

export interface TaskButton extends DefaultProps{
    title:string,
    number:number,
    id:string,
}

export default function TaskButton({title, number, id}:TaskButton) {
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const {height, width} = useWindowDimensions();
    const navigation = useNavigation();
    const adaptiveStyles = StyleSheet.create({
        buttonWrapper: {
            width: adaptiveLess(width, 250, {"700": width/3, "580": width/1.5, "360": width/1.2}),
            height: adaptiveLess(width, 250, {"700": width/3, "580": width/2, "360": width/1.5}),
        },

        buttonContainer: {
            width: adaptiveLess(width, 250, {"700": width/3, "580": width/1.5, "360": width/1.2}),
            height: adaptiveLess(width, 250, {"700": width/3, "580": width/2, "360": width/1.5}),

            padding: adaptiveLess(width, 20, {"700": 15}),
            backgroundColor: colorScheme.cardColor,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "space-evenly",
            shadowColor: colorScheme.shadowColor,
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,

        },
    });
    return (
        <Link style={[adaptiveStyles.buttonWrapper]} to={getLinking().config.screens[id].path}>
            <View style={[adaptiveStyles.buttonContainer]}>
                <ThemeText fontSizeType={FontSizeTypes.big}>{number}</ThemeText>
                <ThemeText fontSizeType={FontSizeTypes.buttonCard} style={{textAlign: "center"}}>{title}</ThemeText>
            </View>
        </Link>
    );
}