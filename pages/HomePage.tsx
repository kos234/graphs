import TaskButton from "../components/TaskButton";
import {Tasks} from "../contents";
import Limiter from "../components/Limiter";

export default function HomePage() {

    return (
        <Limiter style={{
            alignItems: "center", paddingLeft: 30, paddingRight: 30,
            gap: 30,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
        }}>
            {Tasks.map((e, index) => (
                <TaskButton key={e.id} id={e.id} number={index} title={e.title}></TaskButton>
            ))}
        </Limiter>
    );
}
