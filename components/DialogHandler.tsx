import {DefaultProps} from "../globalStyles";
import {useState} from "react";
import {Modal, View} from "react-native";

export type Dialog = {
    id: string,
    isOpen?: boolean,
    title: string,
    content: any,
    isUserCannotClose?: boolean
}

export const enum InteractTypes {
    show,
    close
}

export default function DialogHandler({style, children}: DefaultProps) {
    //NOT USE AND DELETE THIS

    const [modals, setModals] = useState<Dialog[]>([]);

    function dialogInteract(idDialog: string, interact: InteractTypes) {
        setModals(modals.map(dialog => {
            if (dialog.id === idDialog)
                return {...dialog, isOpen: (interact === InteractTypes.show)}
            return dialog;
        }))
    }

    return (
        <View>
            {modals.map(dialog => (
                <Modal key={dialog.id} visible={dialog.isOpen} animationType="slide" transparent={true}
                       onRequestClose={() => {
                           if (dialog.isUserCannotClose)
                               dialogInteract(dialog.id, InteractTypes.close)
                       }}>
                    <View>

                    </View>
                </Modal>
            ))}
        </View>
    )
}