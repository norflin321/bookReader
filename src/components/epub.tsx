import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
// @ts-ignore
import StaticServer from 'react-native-static-server';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Epub from 'epubjs';
import {unzip} from 'react-native-zip-archive';
import cheerio from 'cheerio';

import {Fonts} from '../utils';
import {Btn} from './button';
import {TServerState} from '../types';

const WINDOW_SIZE = Dimensions.get('window').width;
const FONT_SIZE = 19; // '19px'?
const PADDING = 20;

export const RenderBook = () => {
  const [serverState, setServerState] = useState<TServerState>();
  const [pagesWithContent, setPagesWithContent] = useState<any[][]>();
  const [page, setPage] = useState<number>(0);

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
        await unzip(dirPath + fileName, dirPath);
        console.log(await RNFS.readdir(dirPath));

        // start static server
        const server = new StaticServer(30, dirPath, {localOnly: false});
        await server.start();
        setServerState({serverUrl: server._origin, fileName});
        console.log('server:', server);
      } catch (err) {
        console.log('-- ERR:', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      console.log('state:', serverState);
      if (serverState) {
        // load book
        const bookUrl = `${serverState.serverUrl}/${serverState.fileName}`;
        const book = Epub(bookUrl, {
          openAs: 'epub',
          requestHeaders: {Accept: 'text/xml'},
        });
        await book.ready.then(d => d);
        const toc = book.navigation.toc;
        console.log('toc:', toc);
        book.loaded.spine
          .then(async (spine: any) => {
            // book.cover - url to unziped file of cover
            let assetsPath: string;
            // @ts-ignore
            const containerDir = book.container.directory;
            if (containerDir === '.') {
              assetsPath = '/';
            } else {
              assetsPath = `/${containerDir}/`;
            }
            console.log('book:', book, assetsPath);
            console.log('spine:', spine);
            const chapters = [];
            for (const section of spine.spineItems) {
              const url = `${serverState.serverUrl}${section.url.trim()}`;
              const file = await fetch(url).then(r => r.text());
              const el = await section
                .load(book.load.bind(book))
                .then((d: any) => d);
              const $ = cheerio.load(file);
              const html = $('body').html();
              const avaliableTags = 'p, img, image, h1, h2, h3, h4, h5, h6, li';
              const foundTags = $('body').find(avaliableTags);
              const tags: {type: string; value: string}[] = [];
              foundTags.each((_, el) => {
                if (el.name === 'img') {
                  // const imgPath = assetsPath + el.attribs.src;
                  // tags.push({type: 'image', value: imgPath});
                } else if (el.name === 'image') {
                  // const imgPath = assetsPath + el.attribs.href;
                  // tags.push({type: 'image', value: imgPath});
                } else {
                  let tagText = $(el).text();
                  tagText = tagText.replaceAll('\t\t\t', ' ');
                  tagText = tagText.replaceAll('\t\t', ' ');
                  tagText = tagText.replaceAll('\t', ' ');
                  tagText = tagText.replaceAll('\n', '');
                  let tagTextArr = tagText.split(' ');
                  tagTextArr = tagTextArr.filter(s => s !== '');
                  tagText = tagTextArr.join(' ');
                  if (tagText.length <= 0) {
                    return;
                  }
                  let type;
                  if (el.name === 'p') {
                    type = 'text';
                  } else if (el.name === 'li') {
                    type = 'list';
                  } else {
                    type = 'headline';
                  }
                  tags.push({type, value: tagText});
                }
              });
              chapters.push({section, el, html, tags});
            }

            let maxLineLength = (WINDOW_SIZE - PADDING) / (FONT_SIZE / 2);
            maxLineLength = Math.round(maxLineLength);
            console.log('FONT_SIZE:', FONT_SIZE);
            console.log('WINDOW_SIZE:', WINDOW_SIZE);
            console.log('PADDING:', PADDING);
            console.log('maxLineLength:', maxLineLength);

            // create lines of content
            const lines = [];
            for (const chapter of chapters) {
              console.log('chapter:', chapter);
              for (const tag of chapter.tags) {
                const words = tag.value.split(' ');
                const tagLines = [''];
                for (const word of words) {
                  const lastStrIdx = tagLines.length - 1;
                  const currentLength = tagLines[lastStrIdx].length;
                  const lengthWithNew = currentLength + word.length;
                  if (lengthWithNew < maxLineLength) {
                    if (currentLength === 0) {
                      tagLines[lastStrIdx] += word;
                    } else {
                      tagLines[lastStrIdx] += ` ${word}`;
                    }
                  } else {
                    tagLines.push(word);
                  }
                }
                for (const [idx, line] of tagLines.entries()) {
                  let type = tag.type;
                  if (line.length > maxLineLength) {
                    console.log('more then', maxLineLength, line, line.length);
                  }
                  if (type !== 'list' && idx === tagLines.length - 1) {
                    type += '-last';
                  }
                  lines.push({type, value: line.trim()});
                }
              }
            }

            // save data
            console.log('lines:', lines);
          })
          .catch(err => console.log('err:', err));
      }
    })();
  }, [serverState]);

  useEffect(() => {
    console.log(page);
  }, [page]);

  return (
    <View style={styles.container}>
      <View style={{paddingHorizontal: 15}}>
        <Btn title="Load book" onPress={onPress} />
        {/* <TextInput */}
        {/*   value="hello ther test hello ther test hello ther test" */}
        {/*   style={[styles.word, {marginTop: 40}]} */}
        {/*   caretHidden={true} */}
        {/*   contextMenuHidden={false} */}
        {/*   editable={true} */}
        {/*   autoCorrect={false} */}
        {/*   onSelectionChange={({ */}
        {/*     nativeEvent: { */}
        {/*       selection: {start, end}, */}
        {/*     }, */}
        {/*   }) => { */}
        {/*     console.log('selected:', start, end); */}
        {/*   }} */}
        {/*   selectionColor="red" */}
        {/* /> */}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        {pagesWithContent &&
          pagesWithContent[page].map(
            (line: {type: string; value: string}, lineIdx) => (
              <View
                key={lineIdx}
                style={[
                  styles.textLine,
                  line.type === 'text' ? {justifyContent: 'space-between'} : {},
                  line.type === 'text-last' ? {marginBottom: 15} : {},
                ]}>
                {line.value.split(' ').map((word, wordIdx) => (
                  <Text
                    key={wordIdx}
                    style={[
                      styles.word,
                      {marginRight: 6},
                      !line.type.includes('text') ? {color: 'red'} : {},
                      // line.type === 'text-last' ? {marginRight: 6} : {},
                    ]}>
                    {word}
                  </Text>
                ))}
              </View>
            ),
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scrollView: {
    height: '100%',
  },
  textLine: {
    flexDirection: 'row',
  },
  word: {
    fontSize: FONT_SIZE,
    fontFamily: Fonts.regular,
    color: '#abaaa9',
  },
  scrollViewContent: {
    marginHorizontal: PADDING,
    paddingBottom: 50,
    // borderWidth: 1,
    // borderColor: 'white',
  },
  pageControlBtnsContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    width: '100%',
    // backgroundColor: 'red',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  pageControlBtn: {
    width: 50,
  },
});
