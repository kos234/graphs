import {
    StyleSheet,
    Platform,
    Appearance,
    View,
    useWindowDimensions,
    KeyboardAvoidingView
} from 'react-native';
import {Link, NavigationContainer, NavigationState} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomePage from "./pages/HomePage";
import DarkTheme from './imgs/dark_mode.svg';
import LightTheme from './imgs/light_mode.svg';
import ArrowBack from './imgs/arrow_back.svg';
import {useEffect, useRef, useState} from "react";
import {DarkMode, LightMode, AppContext} from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getLinking, Tasks} from "./contents";
import {calculateDefaultStyle} from "./globalStyles";
import NonSelectPressable from "./components/NonSelectPressable";
import {PartialState} from "@react-navigation/routers/lib/typescript/src/types";
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function App() {
    const [colorScheme, setColorScheme] = useState(LightMode);
    const [currentScheme, setCurrentScheme] = useState("light");
    const [currentPage, setCurrentPage] = useState("");
    const {height, width} = useWindowDimensions();
    const listenersTouchEnd = useRef([]);

    function toggleTheme() {
        if (currentScheme === "dark") {
            setColorScheme(LightMode);
            setCurrentScheme("light");
            AsyncStorage.setItem("schemeMode", "light");
        } else {
            setColorScheme(DarkMode);
            setCurrentScheme("dark");
            AsyncStorage.setItem("schemeMode", "dark");
        }
    }

    function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
        if (!state)
            return "";
        const route = state.routes[state?.index || 0];
        if (route.state) {
            return getActiveRouteName(route.state);
        }

        return route.name;
    }

    function sendTouchEndEvent(): void {
        listenersTouchEnd.current.forEach(handler => {
            handler();
        })
    }

    function subscribeTouchEnd(handler: () => void) {
        listenersTouchEnd.current.push(handler);
    }

    function unsubscribeTouchEnd(handler: () => void) {
        const index = listenersTouchEnd.current.indexOf(handler);
        if (index === -1)
            return;

        listenersTouchEnd.current.splice(index, 1);
    }

    const defaultStyle = calculateDefaultStyle(width);

    const screenOptions = {
        statusBarStyle: colorScheme.statusBarStyle,
        statusBarColor: colorScheme.cardColor,
        navigationBarColor: colorScheme.backgroundColor,
        headerStyle: {
            backgroundColor: colorScheme.cardColor,
            height: defaultStyle.fontSize_title.headerHeight,
            borderBottomColor: colorScheme.outlineColor,
        },
        contentStyle: {
            backgroundColor: colorScheme.backgroundColor,
        },
        headerLeft: () => (
            currentPage !== "" && currentPage !== "main" ?
                <Link to={getLinking().config.screens[currentPage].initialRouteName} style={{
                    paddingLeft: Platform.OS === "web" ? 15 : 0,
                    paddingRight: Platform.OS === "web" ? 0 : 10,
                }}>
                    <View hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                          style={{justifyContent: "center", height: "100%"}}>
                        <ArrowBack height={Platform.OS === "web" ? defaultStyle.fontSize_title.backIconSize : 24}
                                   width={Platform.OS === "web" ? defaultStyle.fontSize_title.backIconSize : 24}
                                   fill={colorScheme.textColor}></ArrowBack>
                    </View>
                </Link> : null
        ),
        headerTintColor: colorScheme.textColor,
        headerRight: () => (
            <NonSelectPressable hitSlop={10} onPress={toggleTheme} style={{
                marginRight: Platform.OS === "web" ? 20 : 0,
                justifyContent: "center",
                backgroundColor: colorScheme.cardColor,
            }}>
                {currentScheme === "light" ?
                    <DarkTheme height={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}
                               width={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}/> : null}
                {currentScheme === "dark" ?
                    <LightTheme height={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}
                                width={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}/> : null}
            </NonSelectPressable>
        ),
    };

    if (Platform.OS === "web") {
        //@ts-ignore
        screenOptions.headerTitleStyle = {
            fontSize: defaultStyle.fontSize_title.fontSize
        };

        useEffect(() => {
            document.querySelector("#root").addEventListener("click", sendTouchEndEvent);
            return () => {
                document.querySelector("#root").removeEventListener("click", sendTouchEndEvent);
            }
        }, []);
    }

    useEffect(() => {
        setColorScheme(Appearance.getColorScheme() === "dark" ? DarkMode : LightMode);
        AsyncStorage.getItem("schemeMode").then(res => {
            if (res) {
                setColorScheme(res === "dark" ? DarkMode : LightMode);
                setCurrentScheme(res === "dark" ? "dark" : "light");
            }
        });
    }, []);

    useEffect(() => {
        if (Platform.OS === "web") {
            let styleScrollBar = document.head.querySelector("#custom_scroll_bar");
            if (!styleScrollBar) {
                styleScrollBar = document.createElement("style");
                styleScrollBar.id = "custom_scroll_bar";
                document.head.appendChild(styleScrollBar);
            }
            styleScrollBar.innerHTML = `
                ::-webkit-scrollbar-thumb {
                    background-color: ${colorScheme.scrollBarColor};
                    cursor: pointer;
                }
                ::-webkit-scrollbar {
                    background-color: ${colorScheme.scrollBarBackground};
                    width: 13px
                }
            `;
        }
    }, [colorScheme]);

    return (
        <AppContext.Provider value={{
            colorScheme: colorScheme,
            defaultStyle: defaultStyle,
            subscribeTouchEnd: subscribeTouchEnd,
            unsubscribeTouchEnd: unsubscribeTouchEnd,
        }}>
            <GestureHandlerRootView style={{flex: 1}}>
                <KeyboardAvoidingView onTouchStart={sendTouchEndEvent} behavior={"padding"}
                                      style={{flex: 1, backgroundColor: colorScheme.backgroundColor}}>
                    <NavigationContainer linking={getLinking()}
                                         ref={(e) => {
                                             if (currentPage === "" && e)
                                                 setCurrentPage(getActiveRouteName(e.getState()));
                                         }}
                                         onStateChange={(state) => {
                                             setCurrentPage(getActiveRouteName(state));
                                         }}>
                        {/*//@ts-ignore*!*/}
                        <Stack.Navigator screenOptions={screenOptions}>
                            <Stack.Screen name="main" component={HomePage}
                                          options={{title: "Графы | Главная"}}/>
                            {Tasks.map((e, index) => (
                                //@ts-ignore
                                <Stack.Screen navigationKey={e.id} key={e.id} name={e.id} component={e.component}
                                              options={{title: e.title + " | " + (index)}}/>
                            ))}
                        </Stack.Navigator>
                    </NavigationContainer>
                </KeyboardAvoidingView>
            </GestureHandlerRootView>
        </AppContext.Provider>
    )
}
const styles = StyleSheet.create({});
