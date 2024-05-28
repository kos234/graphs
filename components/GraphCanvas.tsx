import {useWindowDimensions, View} from "react-native";
import {useContext, useEffect, useRef, useState} from "react";
import {DefaultProps} from "../globalStyles";
import {degreesToRadians, drawArrow, drawCircle, range} from "../utils/utils";
import {aCharCode} from "./AdjacencyMatrix";
import {AppContext} from "../colors";
import {FSPath} from "../utils/graphsUtils";

interface GraphCanvasProps extends DefaultProps {
    matrix: { current: null | (number)[][] },
    vertices: number,
    iHateReact: boolean,
    getIsEulersAfterRender?: (isEulers: boolean) =>void,
    runAnimation?: boolean,
    animationPath?: FSPath[],
    onStopAnimation?:()=>void,
    colorGraphs?:number[]
}
const delay = 10;

const colors = [
    "#FF0000",
    "#00008B",
    "#008000",
    "#800080",
    "#FF1493",
    "#00FF00",
    "#0000FF",
    "#FFA500",
    "#ADD8E6",
    "#FFFF00",
    "#006400",
    "#4B0082",
    "#40E0D0",
    "#DA70D6",
    "#FF7F50",
    "#3CB371",
    "#FFD700",
    "#FF6347",
    "#87CEEB",
    "#E6E6FA",
]
export default function GraphCanvas({colorGraphs, onStopAnimation, matrix, vertices, iHateReact, getIsEulersAfterRender, runAnimation, animationPath}: GraphCanvasProps) {
    const {height, width} = useWindowDimensions();
    const refCanvas = useRef();
    const refAnimation = useRef();
    const refCurrentPathIndex = useRef<number>(0);
    const refCurrentPathDate = useRef<number>(0);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const circleRadius = defaultStyle.fontSize_small.fontSize * 2 / 3;
    const refAnimPlay = useRef<boolean>(false);

    console.log("Я НЕНАВИЖУ РЕАКТ", iHateReact);

    function getBase(canvas:HTMLCanvasElement){
        return {
            ctx: canvas.getContext("2d"),
            centerX: canvas.width / 2,
            centerY: canvas.width / 2,
            offsetAtCenter: canvas.width / 3,
        }
    }

    function drawAnimation(){
        if(!refAnimPlay.current || refCurrentPathIndex.current >= animationPath.length) {
            onStopAnimation();
            return;
        }

        let update = false;
        const canvas = refAnimation.current as HTMLCanvasElement;
        const {ctx, centerX, centerY, offsetAtCenter} = getBase(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.width);
        ctx.font = defaultStyle.fontSize_small.fontSize + "px serif";
        const date = new Date().getTime();

        let colorIndex = -1;
        for(let i = 0; i <= refCurrentPathIndex.current; i++){
            const path:FSPath = animationPath[i];
            if(path.last === -1) {
                colorIndex++;
                if(i === refCurrentPathIndex.current && (((date / refCurrentPathDate.current) - 1) * 1e10) >= delay / 2)
                    update = true;
                continue;
            }

            ctx.fillStyle = colors[colorIndex];
            ctx.strokeStyle = colors[colorIndex];
            const firstAngle = degreesToRadians(-90 + 360 / vertices * path.last);
            const firstPointX = centerX + offsetAtCenter * Math.cos(firstAngle);
            const firstPointY = centerY + offsetAtCenter * Math.sin(firstAngle);

            const secondAngle = degreesToRadians(-90 + 360 / vertices * path.current);
            const secondPointX = centerX + offsetAtCenter * Math.cos(secondAngle);
            const secondPointY = centerY + offsetAtCenter * Math.sin(secondAngle);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(firstPointX, firstPointY);
            if(refCurrentPathIndex.current !== i)
                ctx.lineTo(secondPointX, secondPointY);
            else{
                // console.log("i", i);
                let deltaX = (secondPointX - firstPointX) / delay;
                let deltaY = (secondPointY - firstPointY) / delay;
                let xFunction = secondPointX > firstPointX ? Math.min : Math.max;
                let yFunction = secondPointY > firstPointY ? Math.min : Math.max;
                deltaX = xFunction(secondPointX, firstPointX + deltaX * ((date / refCurrentPathDate.current) - 1) * 1e10);
                deltaY = yFunction(secondPointY, firstPointY + deltaY * ((date / refCurrentPathDate.current) - 1) * 1e10);
                ctx.lineTo(deltaX , deltaY);

                if((secondPointX > firstPointX ? deltaX >= secondPointX : deltaX <= secondPointX)
                &&
                    (secondPointY > firstPointY ? deltaY >= secondPointY : deltaY <= secondPointY)
                )
                    update = true;
            }
            ctx.stroke();
        }

        colorIndex = -1;
        for(let i = 0; update ? (i <= refCurrentPathIndex.current) : (i < refCurrentPathIndex.current); i++){
            const path:FSPath = animationPath[i];
            if(path.last === -1)
                colorIndex++;
            const firstAngle = degreesToRadians(-90 + 360 / vertices * path.current);
            const firstPointX = centerX + offsetAtCenter * Math.cos(firstAngle);
            const firstPointY = centerY + offsetAtCenter * Math.sin(firstAngle);
            const nameVertices = String.fromCharCode(aCharCode + path.current);
            const sizeVertices = ctx.measureText(nameVertices);
            const fontHeight = sizeVertices.fontBoundingBoxAscent + sizeVertices.fontBoundingBoxDescent;
            drawCircle(ctx, firstPointX, firstPointY, circleRadius, colorScheme.backgroundColor, colors[colorIndex], 2);
            ctx.fillStyle = colors[colorIndex];
            ctx.fillText(nameVertices, firstPointX - sizeVertices.width / 2, firstPointY + fontHeight / 4)
        }

        if(update){
            refCurrentPathIndex.current++;
            refCurrentPathDate.current = new Date().getTime();
        }

        requestAnimationFrame(drawAnimation);
    }

    useEffect(() => {
        refAnimPlay.current = runAnimation;
        if(refAnimation.current == null || !runAnimation)
            return;

        refCurrentPathIndex.current = 1;
        refCurrentPathDate.current = new Date().getTime();
        requestAnimationFrame(drawAnimation);
    }, [runAnimation]);

    useEffect(() => {
        if(refAnimation.current){
            const canvas = refAnimation.current as HTMLCanvasElement;
            const {ctx, centerX, centerY, offsetAtCenter} = getBase(canvas);
            ctx.clearRect(0, 0, canvas.width, canvas.width);
        }

        setTimeout(() => {
            if(refCanvas.current == null)
                return;
            const canvas = refCanvas.current as HTMLCanvasElement;
            const {ctx, centerX, centerY, offsetAtCenter} = getBase(canvas);
            ctx.clearRect(0, 0, canvas.width, canvas.width);
            ctx.fillStyle = colorScheme.textColor;
            ctx.font = defaultStyle.fontSize_small.fontSize + "px serif";

            const pows: number[] = Array(vertices).fill(0);
            let isEulers = true;
            for (let i = 0; i < vertices; i++) {
                const angle = degreesToRadians(-90 + 360 / vertices * i);
                const pointX = centerX + offsetAtCenter * Math.cos(angle);
                const pointY = centerY + offsetAtCenter * Math.sin(angle);
                for (let j = 0; j < vertices; j++) {
                    if (i === j)
                        continue;

                    pows[i] += Math.max(+(matrix.current[i][j] > 0),+(matrix.current[j][i] > 0));
                    const isLine = matrix.current[i][j] === matrix.current[j][i];
                    if (matrix.current[i][j] === 0)
                        continue;
                    if(i > j && matrix.current[j][i] !== 0)
                        continue;

                    const otherAngle = degreesToRadians(-90 + 360 / vertices * j);
                    const otherPointX = centerX + offsetAtCenter * Math.cos(otherAngle);
                    const otherPointY = centerY + offsetAtCenter * Math.sin(otherAngle);

                    if (isLine) {
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(pointX, pointY);
                        ctx.lineTo(otherPointX, otherPointY);
                        ctx.stroke();
                    } else {
                        drawArrow(ctx, pointX, pointY, otherPointX, otherPointY);
                    }

                    if(matrix.current[j][i] != 1) {
                        const nameVertices = matrix.current[j][i] + "";
                        const sizeVertices = ctx.measureText(nameVertices);
                        const fontHeight = sizeVertices.fontBoundingBoxAscent + sizeVertices.fontBoundingBoxDescent;
                        ctx.fillStyle = colorScheme.textColor;
                        let deltaX = 0;
                        let deltaY = 0;
                        if(Math.abs(pointX - otherPointX) > Math.abs(pointY - otherPointY)){
                            deltaY += 20;
                        }else{
                            deltaX += 20;
                        }
                        ctx.fillText(nameVertices, (pointX + otherPointX + deltaX) / 2 - sizeVertices.width / 2, (pointY + otherPointY + deltaY) / 2 + fontHeight / 4)

                    }
                }

                isEulers &&= pows[i] % 2 == 0
            }

            const isColored = colorGraphs != null || colorGraphs != undefined;
            for (let i = 0; i < vertices; i++) {
                const angle = degreesToRadians(-90 + 360 / vertices * i);
                const pointX = centerX + offsetAtCenter * Math.cos(angle);
                const pointY = centerY + offsetAtCenter * Math.sin(angle);
                const nameVertices = String.fromCharCode(aCharCode + i);
                const sizeVertices = ctx.measureText(nameVertices);
                const fontHeight = sizeVertices.fontBoundingBoxAscent + sizeVertices.fontBoundingBoxDescent;
                drawCircle(ctx, pointX, pointY, circleRadius, colorScheme.backgroundColor, isColored ? colors[colorGraphs[i]] : colorScheme.textColor, 2);
                // console.log("i", i, pointX, pointY)
                ctx.fillStyle = isColored ? colors[colorGraphs[i]] : colorScheme.textColor;
                ctx.fillText(nameVertices, pointX - sizeVertices.width / 2, pointY + fontHeight / 4)
                ctx.fillStyle = colorScheme.textColor;

                let sum = 0;
                for (let j = 0; j < vertices; j++) {
                    if (matrix.current[j][i] === 0)
                        continue;
                    sum++;
                }

                const powSizeVertices = ctx.measureText("" + pows[i]);
                const powActualHeight = powSizeVertices.actualBoundingBoxAscent + powSizeVertices.actualBoundingBoxDescent;

                let powPointX = centerX + (offsetAtCenter + circleRadius + 6) * Math.cos(angle);
                let powPointY = centerY + (offsetAtCenter + circleRadius + 6) * Math.sin(angle);

                if (i === 0) {
                    powPointX -= powSizeVertices.width / 2;
                } else if (Math.floor(vertices / 2) === i) {
                    powPointY += powActualHeight;
                } else if (Math.round(vertices / 2) === i) {
                    powPointY += powActualHeight;
                    powPointX -= powSizeVertices.width;
                } else if (i < vertices / 2) {
                    powPointY += powActualHeight / 2;
                } else if (i > vertices / 2) {
                    powPointY += powActualHeight / 2;
                    powPointX -= powSizeVertices.width;
                }

                ctx.fillText("" + pows[i], powPointX, powPointY)
            }

            if(getIsEulersAfterRender)
                getIsEulersAfterRender(isEulers);
        }, 10);
    }, [iHateReact]);

    return (
        <>
            {matrix.current != null ?
                <View style={{position: "relative"}}>
                    <canvas width={400} height={400} style={{width: width / 4, height: width / 4}} ref={refCanvas}></canvas>
                    <canvas width={400} height={400} style={{position: "absolute", left: 0, top:0, width: width / 4, height: width / 4}} ref={refAnimation}></canvas>
                </View>
                : null
            }
        </>
    )
}
