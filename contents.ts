import Task0 from "./pages/Task0";
import type {LinkingOptions} from "@react-navigation/native/lib/typescript/src/types";
import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";
import Task3 from "./pages/Task3";
import Task4 from "./pages/Task4";
import Task5 from "./pages/Task5";
import Task6 from "./pages/Task6";

export const Tasks = [
    {title: "Хз как назвать", id: "task0", component: Task0},
    {title: "Остаточная функции", id: "task1", component: Task1},
    {title: "Функция по остаточным", id: "task2", component: Task2},
    {title: "Функция по остаточным", id: "task3", component: Task3},
    {title: "Игра. Имя функции", id: "task4", component: Task4},
    {title: "Игра. Существенные и фиктивные переменные", id: "task5", component: Task5},
    {title: "Игра. ДНФ", id: "task6", component: Task6},
    // {title: "Игра. КНФ", id: "task7", component: Task7},
    // {title: "СДНФ по вектору", id: "task8", component: Task8},
    // {title: "СКНФ по вектору", id: "task9", component: Task9},
    // {title: "Игра. Предполные классы", id: "task10", component: Task10},
    // {title: "Игра. Полные системы булевых функций", id: "task11", component: Task11},
    // {title: "ДНФ из функции", id: "task12", component: Task12},
]

const link:LinkingOptions<ReactNavigation.RootParamList> = {config: undefined, prefixes: ['https://testTasks.test', 'testTasks://']};

export function getLinking():LinkingOptions<ReactNavigation.RootParamList>{
    if(link.config == undefined){
        link.config = {
            screens: {
                main: "",
            }
        };

        for(let i = 0; i < Tasks.length; i++){
            link.config.screens[Tasks[i].id] = {
                path: "/task/" + (i + 1),
                initialRouteName: "/"
            }
        }
    }

    return link;
}
