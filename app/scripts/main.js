'use strict';

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext(); 
var myAnalyzer = audioContext.createAnalyser();

var gUM = Modernizr.prefixed('getUserMedia', navigator);
var scriptNode, input, audioInput, array, chunkSize, levelBars;
var processAudio = function() {
    console.log('processing ' + myAnalyzer.frequencyBinCount);
    myAnalyzer.getByteFrequencyData(array);
    var chunkTotal = 0;
    for(var i = 0; i < array.length;i++){
        chunkTotal+=array[i];
        if(i%chunkSize==chunkSize-1){
            //console.log('setin height of levelbar ' + Math.floor(i/chunkSize) + " to "+ chunkTotal/chunkSize + 'px');
            levelBars[Math.floor(i/chunkSize)].style.height = chunkTotal/chunkSize + 'px';
            chunkTotal = 0;
        }
    }
};
gUM({audio: true}, function(stream) {
    input = audioContext.createMediaStreamSource(stream);
    audioInput = convertToMono( input ); 
    myAnalyzer = audioContext.createAnalyser();
    myAnalyzer.smoothingTimeConstant = 0.3;
    myAnalyzer.fftSize = 1024;
    audioInput.connect(myAnalyzer); 
    scriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    myAnalyzer.connect(scriptNode);
    array =  new Uint8Array(myAnalyzer.frequencyBinCount);
    chunkSize = Math.floor(array.length/16);
    levelBars = $('#vis > div').toArray();
    console.log("chunkSize: " + chunkSize + " levelBars.length: " + levelBars.length+ 'frequencyBinCount: ' + myAnalyzer.frequencyBinCount);
    scriptNode.onaudioprocess = processAudio;
}, function(e) {
    console.log('Reeeejected!', e);
});


function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
} 