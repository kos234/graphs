import {ReactNode} from "react";

export function binSearch<T>(findValue:T, array:T[], comparator: (a:T, b:T)=>number):number|undefined{
    let start:number = 0;
    let end:number = array.length - 1;

    while (start <= end){
        const mid:number = Math.floor((start + end) / 2);
        const compRes = comparator(array[mid], findValue);
        if(compRes === 0) {
            return mid;
        }
        else if (compRes < 0)
            start = mid + 1;
        else
            end = mid - 1;

    }
    return undefined;
}


export function adaptiveLess(value:number, defaultStyle:number, adaptiveStyle: Object):number {
    let keys:number[] = Object.keys(adaptiveStyle).map(key => parseInt(key)).sort((a, b) => {
        return b - a
    });

    let start:number = 0;
    let end:number = keys.length - 1;

    while (start <= end) {
        const mid:number = Math.floor((start + end) / 2);
        if (keys[mid] === value) {
            return adaptiveStyle[keys[mid]];
        } else { // @ts-ignore
            if (keys[mid] > value) {
                start = mid + 1; // Ищем в правой половине
            } else {
                end = mid - 1; // Ищем в левой половине
            }
        }
    }
    if (start === 0)
        return defaultStyle;
    return adaptiveStyle[keys[start - 1]];
}

export function getRandom(start:number, end:number):number {
    return Math.random() * (end - start) + start;
}

export function forTo(value:number, callBack:(index:number) => any):any[] {
    let list = [];
    for (let i:number = 0; i < value; i++) {
        list.push(callBack(i));
    }

    return list;
}

export function range(value:number):number[] {
   return [...Array(value).keys()];
}

export function fastUniqueArray(array:number[]):void{
    for(let i = 1; i < array.length; i++){
        if(array[i - 1] === array[i]){
            array.splice(i, 1);
            i--;
        }
    }
}

export function safeToString(value:any):string{
    if(value == null || Number.isNaN(value))
        return "";
    return value + "";
}

export function fastParse0or1(value:string){
    return value === "1" ? 1 : (value === "0" ? 0 : 9)
}

export type GetArrayReturnType<T, DefaultType> = T extends () => (infer U)[] ? U : DefaultType;

export function equalSet<T>(a:Set<T>, b:IterableIterator<T>):boolean{
    let iterCount = 0;
    for(let value of b){
        if(!a.has(value))
            return false;
        iterCount++;
    }

    return iterCount === a.size;
}

export function degreesToRadians(degrees:number) {
    return degrees * (Math.PI / 180);
}

export function drawCircle(ctx:CanvasRenderingContext2D, x:number, y:number, radius:number, fill:string, stroke:string, strokeWidth:number) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth
        ctx.strokeStyle = stroke
        ctx.stroke()
    }
}

export function drawArrow(ctx:CanvasRenderingContext2D, fromX:number, fromY:number, toX:number, toY:number) {
    const headlen = 10; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    toX = (fromX + toX) / 2;
    toY = (fromY + toY) / 2;

    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}
