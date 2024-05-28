import Task0 from "./pages/Task0";
import type {LinkingOptions} from "@react-navigation/native/lib/typescript/src/types";
import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";
import Task3 from "./pages/Task3";
import Task4 from "./pages/Task4";
import Task5 from "./pages/Task5";
import Task6 from "./pages/Task6";
import Task7 from "./pages/Task7";
import Task8 from "./pages/Task8";
import Task9 from "./pages/Task9";
import Task10 from "./pages/Task10";
import Task11 from "./pages/Task11";
import Task12 from "./pages/Task12";

export const Tasks = [
    {title: "Информация о графе", id: "task0", component: Task0},
    {title: "Обход графа в глубину", id: "task1", component: Task1},
    {title: "Проверка обхода в глубину", id: "task2", component: Task2},
    {title: "Обход графа в ширину", id: "task3", component: Task3},
    {title: "Проверка обхода в ширину", id: "task4", component: Task4},
    {title: "Число компонент связностей", id: "task5", component: Task5},
    {title: "Проверить число компонент связностей", id: "task6", component: Task6},
    {title: "Минимальное остовное дерево", id: "task7", component: Task7},
    {title: "Кратчайший путь от вершины", id: "task8", component: Task8},
    {title: "Матрица кратчайших путей", id: "task9", component: Task9},
    {title: "Кодирование Прюфера", id: "task10", component: Task10},
    {title: "Декодирование Прюфера", id: "task11", component: Task11},
    {title: "Раскраска графа", id: "task12", component: Task12},
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
