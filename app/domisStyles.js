import{ StyleSheet } from 'react-native';

export const domisStyle = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    horizontalContainer: {
        flexDirection: 'row',
        backgroundColor: '#3D2022',
        alignItems: "center"
        
    },
    currentNoteContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    currentNoteText: {
        fontSize: 96,
        fontWeight: '900',
        textAlign: 'left',
        color: '#000',
    },
    noNoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
    },
    centsDifferenceText: {
        fontSize: 36,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'left',
        color: '#444',
    },
    buttonStyle: {
        color: 'white',
        flex: 1,       
    },
    buttonTextStyle: {
        textAlign: "center",
        fontSize: 30
    },
    pickerStyle: {
        backgroundColor: '#313639',
        flex:1
    },
    checkBoxContainer: {
        flexDirection: 'row',
        backgroundColor: '#313639',
        flex:1,
    },
    audioDynamicsContainer: {
        width: 110,
        alignItems: 'flex-end',
    },
    audioValueText: {
        fontSize: 60,
        fontWeight: '900',
        color: '#000',
    },
    deleteButtonsContainer: {
        marginTop: 30,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    playButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        marginRight: 15,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    timeText: {
        width: 40,
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
    },
    sliderContainer: {
        flex: 1,
        marginHorizontal: 10,
    },
    slider: {
        height: 40,
    },
    deleteAllButton: {
        backgroundColor: '#FF453A',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    audioLabelText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#444',
        marginTop: 4,
    },
    checkBoxLargeContainer: {
        flexDirection: 'column',
        flex:1
    },
    checkBoxStyle: {
        backgroundColor: 'black',
        height:50,
        width:50,
    },
    center: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    userIdText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
 })

export default domisStyle