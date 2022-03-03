import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
} from 'react-native';
import {RenderBook} from './src/components/epub';
// import LinearGradient from 'react-native-linear-gradient';
// import loremText from './src/lorem';
import {Fonts} from './src/utils';

const App = () => {
  const [hideStatusBar] = useState(true);
  // const [darkMode] = useState(true);
  return (
    <>
      <StatusBar barStyle="dark-content" hidden={hideStatusBar} />
      <View style={[styles.statusBar, {height: hideStatusBar ? 0 : 50}]}>
        <Image
          source={require('./assets/img8.jpeg')}
          style={styles.statusBarImg}
          blurRadius={40}
        />
      </View>
      <View style={styles.appContainer}>
        <RenderBook />
      </View>
      {/* <LinearGradient */}
      {/*   colors={darkMode ? ['#272325', '#272325'] : ['#EEEEEE', '#ffffff']} */}
      {/*   style={{flex: 1}}> */}
      {/*   <ScrollView */}
      {/*     style={{flex: 1}} */}
      {/*     showsVerticalScrollIndicator={false} */}
      {/*     contentContainerStyle={{padding: 18, paddingTop: 55}}> */}
      {/*     <Text */}
      {/*       style={[styles.text, {color: darkMode ? '#abaaa9' : '#272325'}]}> */}
      {/*       {loremText} */}
      {/*     </Text> */}
      {/*   </ScrollView> */}
      {/* </LinearGradient> */}
    </>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  statusBarImg: {opacity: 0.95, height: '100%', width: '100%'},
  text: {
    fontSize: 19,
    textAlign: 'justify',
    fontFamily: Fonts.regular,
  },
  appContainer: {
    backgroundColor: '#191A19',
    height: '100%',
    paddingTop: 50,
  },
});

export default App;
