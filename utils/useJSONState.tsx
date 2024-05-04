import {useRef, useState} from "react";

export default function useJSONState<JSON>(initialState: JSON):[{current: JSON}, ()=>void]{
    const [updateState, triggerUpdateState] = useState<boolean>(false);
    const refArray = useRef<JSON>(initialState);

    return [refArray, () => {
        triggerUpdateState(!updateState);
    }]
}