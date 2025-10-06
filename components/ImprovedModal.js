import React from 'react';
import { 
    Modal, 
    View, 
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    StyleSheet,
    Dimensions 
} from 'react-native';

const { height } = Dimensions.get('window');

const ImprovedModal = ({ 
    visible, 
    onClose, 
    children, 
    animationType = 'slide',
    transparent = true 
}) => {
    const handleBackdropPress = () => {
        console.log('🔧 Modal backdrop pressed - closing modal');
        if (onClose) {
            onClose();
        }
    };

    const handleModalContentPress = (event) => {
        // Prevenir que el toque en el contenido cierre el modal
        event.stopPropagation();
    };

    return (
        <Modal
            visible={visible}
            transparent={transparent}
            animationType={animationType}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={handleModalContentPress}>
                        <View style={styles.modalContent}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: height * 0.7,
    },
});

export default ImprovedModal;