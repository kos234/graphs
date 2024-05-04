import {useRef, useState} from "react";

export default function useErrorState(initialState:string, delay:number = 400):[string, {current: boolean }, (value:string)=>void]{
    const [innerError, setInnerError] = useState<string>(null);
    const refDelayTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const isInnerError = useRef<boolean>(false);

    return [innerError, isInnerError, (value:string) => {
        isInnerError.current = value != null && value.length !== 0;

        clearInterval(refDelayTimer.current);
        if(delay === 0){
            setInnerError(value);
            return;
        }else{
            setInnerError(null)
        }

        refDelayTimer.current = setTimeout(() => {
            setInnerError(value)
        }, delay);
    }]
}