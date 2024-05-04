import {
    Platform,
} from 'react-native';
import Canvas from "react-native-canvas";
export default function CrossCanvas({ref}){
    return (
        <>
            {Platform.OS === "web" ? <canvas ref={ref}></canvas> : <Canvas ref={ref}></Canvas>}
        </>
    )
}
