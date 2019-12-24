# vudio <img src="https://img.shields.io/npm/v/vudio" /> <img src="https://img.shields.io/npm/l/vudio.svg" alt="license">
### Visualization audio using AudioContext and Canvas

Many visual effects:

![多種視覺效果](https://github.com/alex2wong/vudio/blob/master/demo_src/snapshot.jpg?raw=true)

------
#### Features：
- Support effect and custom styles
- Animation based on Canvas and requestAnimationFrame

#### Install and use

```bash
npm i vudio --save
# or install by yarn
yarn add vudio
```
```javascript
import Vudio from 'vudio'
```
using CDN:
```html
<script src="https://unpkg.com/vudio@2.1.1/umd/vudio.js"></script>
```
Use Vudio
```javascript
var vudio = new Vudio(HTMLAudioElement | MediaStream, HTMLCanvasElement, [option]);
vudio.dance();
```

#### Examples
```html
<canvas width="256px" height="100px" id="canvas"></canvas>
<audio src="./path/to/audio.mp3" controls id="audio"></audio>
<script src="path/to/vudio.js"></script>
```
Since AudioContext can NOT use CORS resource, so make sure you have fully control of audio resource

```javascript
var audioObj = document.querySelector('#audio');
var canvasObj = document.querySelector('#canvas');
var vudio = new Vudio(audioObj, canvasObj, {
    effect : 'waveform', // waveform, circlewave, circlebar, lighting (4 visual effect)
    accuracy : 128, // number of freqBar, must be pow of 2.
    width : 256, // canvas width
    height : 100, // canvas height
    waveform : {
        maxHeight : 80, // max waveform bar height
        minHeight : 1, // min waveform bar height
        spacing: 1, // space between bars
        color : '#f00', // string | [string] color or waveform bars
        shadowBlur : 0, // blur of bars
        shadowColor : '#f00', 
        fadeSide : true, // fading tail
        horizontalAlign : 'center', // left/center/right, only effective in 'waveform'/'lighting'
        verticalAlign: 'middle' // top/middle/bottom, only effective in 'waveform'/'lighting'
    }
});

vudio.dance();

// pause as you wish
vudio.pause();

// change option reactively.
vudio.setOption({
    waveform : {
        color : '#06f',
        verticalAlign: 'bottom'
    }
});
```

Online Demo: https://alex2wong.github.io/vudio/

### Related VSC extension

![vscode extension](https://user-images.githubusercontent.com/10528482/64496866-f1eca780-d2db-11e9-92e5-cc179758d035.gif)

Listen netease music and watch visualization in VSCode :)
Install by vsix file
https://github.com/alex2wong/vsc-netease-music/releases

related issue:
https://github.com/nondanee/vsc-netease-music/issues/63

### Acknowledge

Inspired and based on https://github.com/margox/vudio.js.git
