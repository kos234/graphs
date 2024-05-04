import {View, StyleSheet, useWindowDimensions, ScrollView} from "react-native";
import {adaptiveLess} from "../utils/utils";
import {DefaultProps} from "../globalStyles";
import {useContext} from "react";
import {AppContext} from "../colors";

export interface LimiterProps extends DefaultProps {
    notScroll?: boolean,
    styleMain?: typeof this.style,
}

export default function Limiter({notScroll, children, style, styleMain}: LimiterProps) {
    return (
        <>
            {notScroll ?
                <View>
                    <LimiterInner styleMain={styleMain} children={children} style={style}/>
                </View>
                :
                <ScrollView style={{}}>
                    <LimiterInner styleMain={styleMain} children={children} style={style}/>
                </ScrollView>
            }
        </>
    );
}


function LimiterInner({children, style, styleMain}: LimiterProps) {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);

    const styles = StyleSheet.create({
        wrapperContainer: {
            justifyContent: "center",
            flexDirection: "row",
            minHeight: height - defaultStyle.fontSize_title.headerHeight,
        },
        mainContainer: {
            marginTop: adaptiveLess(width, 40, {"700": 20}),
            marginBottom: adaptiveLess(width, 40, {"700": 20}),
            width: width * adaptiveLess(width, 0.55, {"1270": 0.7, "1048": 0.8, "700": 0.9}),
        }
    });

    return (
        <View style={[styles.wrapperContainer, styleMain]}>
            <View style={[styles.mainContainer, style]}>
                {children}
            </View>
        </View>
    )
}