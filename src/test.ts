export const test = {};
// const metadata = await book.loaded.metadata.then(d => d);
// console.log('- book:', book, book.locations);
// const locations = await book.locations.generate(0);
// const cfi = book.locations.cfiFromPercentage(0.5);
// console.log(locations);
// const rendition = new Rendition(book, {manager: 'default'});
// console.log(rendition);
// setTimeout(() => {
//   console.log(rendition.getContents());
// }, 1000);

// v1
// const processRange = (range: any) => {
//   console.log('- range:', range, range.toString());
//   const startText = range.startContainer.data.replaceAll('\t', ' ');
//   const endText = range.endContainer.data.replaceAll('\t', ' ');
//   console.log(startText + endText);
// };
// book.getRange(locations[0]).then(range => {
//   processRange(range);
//   book.getRange(locations[1]).then(range2 => {
//     processRange(range2);
//   });
// });

// v2
// how to find when real book starts, to skipp all first cover and toc sections? Sections.linear = true?
// test with 5 different books
// Spine.manifest - files and image urls, can be found after unzip
