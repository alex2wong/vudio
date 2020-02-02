var UPDATE_DURATION = 50;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var chartCont = document.querySelector('#chart');

var oReq = new XMLHttpRequest();
oReq.open("GET", "./demo_src/Happy Corporate Ukulele & Whistle.mp3", true);
oReq.responseType = "arraybuffer";

oReq.onload = function(e) {
  audioContext.decodeAudioData(oReq.response, initVisualizer);
};
oReq.send();

function initVisualizer(audioBuffer) {
  inited = true;

  var source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  // Must invoked right after click event
  if (source.noteOn) {
    source.noteOn(0);
  } else {
    source.start(0);
  }

  var analyzer = audioContext.createAnalyser();
  var gainNode = audioContext.createGain();
  analyzer.fftSize = 2048;

  gainNode.gain.value = .5;
  source.connect(gainNode);
  gainNode.connect(analyzer);
  analyzer.connect(audioContext.destination);

  var frequencyBinCount = analyzer.frequencyBinCount;
  console.warn('frequencyBinCount from analyzer:  ', frequencyBinCount);
  var dataArray = new Uint8Array(frequencyBinCount);
  var timeWave = new Uint8Array(frequencyBinCount);

  var beta = 0;
  function update() {
    analyzer.getByteFrequencyData(dataArray);

    var item = [];
    var size = 24;
    var dataProvider = [];

    for (var i = 0; i < size * size; i++) {
      var x = i % size;
      var y = Math.floor(i / size);
      var dx = x - size / 2;
      var dy = y - size / 2;

      var angle = Math.atan2(dy, dx);
      if (angle < 0) {
        angle = Math.PI * 2 + angle;
      }
      var dist = Math.sqrt(dx * dx + dy * dy);
      var idx = Math.min(
        frequencyBinCount - 1,
        Math.round((angle / Math.PI / 2) * 60 + dist * 60) + 100
      );

      var val = Math.pow(dataArray[idx] / 100, 3);
      dataProvider.push([x, y, Math.max(val, 0.1)]);
    }

    myChart.setOption({
      grid3D: {
        // viewControl: {
        //   beta: beta,
        //   alpha:
        //     ((Math.sin(beta / 10 + 40) * ((beta % 10) + 5)) / 15) * 30 + 30,
        //   distance:
        //     ((Math.cos(beta / 50 + 20) * ((beta % 10) + 5)) / 15) * 50 + 80,
        //   animationDurationUpdate: UPDATE_DURATION,
        //   animationEasingUpdate: "linear"
        // }
      },
      series: [
        {
          data: dataProvider
        }
      ]
    });
    beta += 2;

    requestAnimationFrame(update);
  }

  update();
}

option = {
  tooltip: {},
  visualMap: {
    show: false,
    min: 0.1,
    max: 4,
    inRange: {
      color: ["#010103", "#2f490c", "#b0b70f", "#fdff44", "#fff"]
    }
  },
  xAxis3D: {
    type: "value"
  },
  yAxis3D: {
    type: "value"
  },
  zAxis3D: {
    type: "value",
    min: -6,
    max: 6
  },
  grid3D: {
    show: false,
    environment: "#333",
    viewControl: {
      distance: 200
    },
    postEffect: {
      enable: true,
      FXAA: {
        enable: true
      }
    },
    light: {
      main: {
        shadow: true,
        intensity: 10,
        quality: "medium"
      },
      ambientCubemap: {
        texture: "./demo_src/data-1491896094618-H1DmP-5px.hdr",
        exposure: 0,
        diffuseIntensity: 0.8
      }
    }
  },
  series: [
    {
      type: "bar3D",
      silent: true,
        // shading: "lambert",
      shading: "realistic",
      realisticMaterial: {
        roughness: .8,
        textureTiling: 10,
        detailTexture: "./demo_src/data-1491896059428-B1QbPbq6e.jpg"
      },
      data: [],
      barSize: 2,
      lineStyle: {
        width: 4
      },
      // animation: false,
      animationDurationUpdate: UPDATE_DURATION
    }
  ]
};

myChart = echarts.init(chartCont);
myChart.setOption(option);
