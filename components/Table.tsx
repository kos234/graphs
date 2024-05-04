import {DefaultProps} from "../globalStyles";
import {StyleSheet, useWindowDimensions, View} from "react-native";
import {adaptiveLess} from "../utils/utils";

export default function Table({style, children}:DefaultProps) {

    const tableStyle = StyleSheet.create({
        table: {
            alignItems: "flex-start",
            flexDirection: "column",
        },
    });

    return (
        <View style={[tableStyle.table, style]}>
            {children}
        </View>
    );
}

export function TableColumn({style, children}:DefaultProps){
    const {height, width} = useWindowDimensions();

    return (
        <View style={[{width: adaptiveLess(width, 40, {"1270": 35, "425": 32}), height: adaptiveLess(width, 40, {"1270": 35, "425": 32})}, style]}>
            {children}
        </View>
    )
}

export function TableRow({style, children}:DefaultProps){
    return (
        <View style={[{flexDirection: "row"}, style]}>
            {children}
        </View>
    );
}
export function TableHeader({style, children}:DefaultProps){
    return (
       <TableRow style={[style]}>
           {children}
       </TableRow>
    );
}