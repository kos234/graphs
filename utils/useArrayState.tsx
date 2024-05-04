import {useRef, useState} from "react";

export function fastClearArray<T>(array:T[] | {current: T[]}):void{
    if(Array.isArray(array)){
        (array as T[]).splice(0, (array as T[]).length);
    }else{
        (array as {current: T[]}).current.splice(0, (array as {current: T[]}).current.length);
    }
}
export default function useArrayState<T>(initialState: T[]):[{current: T[]}, ()=>void]{
    const [updateState, triggerUpdateState] = useState<boolean>(false);
    const refArray = useRef<T[]>(initialState);

    return [refArray, () => {
        triggerUpdateState(!updateState);
    }]
}