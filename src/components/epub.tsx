import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
// import RenderHTML from 'react-native-render-html';
import WebView from 'react-native-webview';
// import RNFetchBlob from 'rn-fetch-blob';
// @ts-ignore
import StaticServer from 'react-native-static-server';
// import lorem from '../lorem';
import {Fonts} from '../utils';
import {Btn} from './button';
import DocumentPicker from 'react-native-document-picker';
// @ts-ignore
import RNFS from 'react-native-fs';
import Epub from 'epubjs';
// import JSZip from 'jszip';
// import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';

export const RenderBook = () => {
  const [state, setState] = useState<{serverUrl: string; fileName: string}>();
  const [pageContent, setPageContent] = useState<string>();

  const onPress = useCallback(() => {
    (async () => {
      try {
        // pick file
        const pickerRes = await DocumentPicker.pick({});
        const file = pickerRes[0];
        const fileName = file.name;
        const dirPath = file.uri.replace(fileName, '').replace('file://', '');
        console.log('dirPath:', dirPath);

        // check picked file directory
        const dir = await RNFS.readdir(dirPath);
        console.log('dir:', dir);

        // unzip book content
        // await unzip(dirPath + fileName, dirPath);
        // console.log(await RNFS.readdir(dirPath));

        // start static server
        const server = new StaticServer(30, dirPath, {localOnly: false});
        await server.start();
        setState({serverUrl: server._origin, fileName});
        console.log('server:', server);
      } catch (err) {
        console.log('-- ERR:', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      console.log('state:', state);
      if (state) {
        // load book
        const bookUrl = `${state.serverUrl}/${state.fileName}`;
        const book = Epub(bookUrl, {
          openAs: 'epub',
          requestHeaders: {Accept: 'text/xml'},
        });
        await book.ready.then(d => d);
        // const metadata = await book.loaded.metadata.then(d => d);
        console.log('- book:', book);
        const locations = await book.locations.generate(100);
        console.log(locations);
        book.getRange(locations[0]).then(range => {
          console.log('- range:', range);
          setPageContent(range.startContainer.data.replaceAll('\t', ' '));
        });
        // book.loaded.spine
        //   .then(async spine => {
        //     // console.log(spine, typeof spine);
        //     const contents = [];
        //     // @ts-ignore
        //     for (const item of spine.spineItems) {
        //       // console.log('item:', item);
        //       const content = await item
        //         .load(book.load.bind(book))
        //         .then((d: any) => d);
        //       const text: string = content.textContent;
        //       contents.push(text.replaceAll('\t', ' '));
        //     }
        //     setPagesContent(contents);
        //   })
        //   .catch(err => console.log('err:', err));
      }
    })();
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={{paddingHorizontal: 15}}>
        <Btn title="Load book" onPress={onPress} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        {pageContent && <Text style={styles.text}>{pageContent}</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scrollView: {
    height: '100%',
  },
  text: {
    fontSize: 19,
    textAlign: 'justify',
    fontFamily: Fonts.regular,
    color: '#abaaa9',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
});
