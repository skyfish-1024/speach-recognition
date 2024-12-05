var language = "en";
var nthreads = 8;
var Module = {
    print: printTextarea,
    printErr: printTextarea,
    setStatus: function (text) {
        printTextarea("js: " + text);
    },
    monitorRunDependencies: function (left) {},
};

// audio data
var audio = null;

// the whisper instance
var instance = null;
var model_whisper = "";

// helper function
function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

//
// load model
//

let dbVersion = 1;
let dbName = "speech-recognition";
let indexedDBValid = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB;

function storeFS(fname, buf) {
    // write to WASM file using FS_createDataFile
    // if the file exists, delete it
    try {
        Module.FS_unlink(fname);
    } catch (e) {
        // ignore
    }

    Module.FS_createDataFile("/", fname, buf, true, true);

    //model_whisper = fname;

    printTextarea('loaded "' + model_whisper + '"!');

    printTextarea("storeFS: stored model: " + fname + " size: " + buf.length);
    loaded = true;
    sendMessage({
        evt: "speech-recognition-loaded",
        loaded: loaded,
    });
}

function loadFile(event, fname) {
    var file = event.target.files[0] || null;
    if (file == null) {
        return;
    }

    printTextarea("loadFile: loading model: " + file.name + ", size: " + file.size + " bytes");
    printTextarea("loadFile: please wait ...");

    var reader = new FileReader();
    reader.onload = function (event) {
        var buf = new Uint8Array(reader.result);
        storeFS(fname, buf);
    };
    reader.readAsArrayBuffer(file);
}

function loadWhisper(modelName, modelUrl) {
    let url = modelUrl;
    let dst = "whisper.bin";
    let size_mb = 75;

    model_whisper = modelName;
    cbProgress = function (p) {
        // printTextarea("模型加载：", Math.round(100 * p) + "%");
        sendMessage({
            evt: "speech-recognition-loading",
            progress: Math.round(100 * p),
        });
    };

    cbCancel = function () {};

    loadRemote(url, dst, size_mb, cbProgress, storeFS, cbCancel, printTextarea);
}

//
// audio file
//

const kMaxAudio_s = 30 * 60;
const kMaxRecording_s = 2 * 60;
const kSampleRate = 16000;

function loadAudioFromUint8Array(audioChannelData) {
    if (!audioChannelData) {
        return false;
    }

    printTextarea("js: loading audio bytes array ");
    printTextarea("js: please wait ...");

    audio = audioChannelData;
    printTextarea("js: audio loaded, size: " + audio.length);

    if (audio.length > kMaxAudio_s * kSampleRate) {
        audio = audio.slice(0, kMaxAudio_s * kSampleRate);
        sendMessage({
            evt: "speech-recognition-error",
            msg: "audio too long.  truncated audio to first " + kMaxAudio_s + " seconds",
        });
    }
    onProcess(false);
}

//
// transcribe
//

function onProcess(translate) {
    if (!instance) {
        instance = Module.init("whisper.bin");

        if (instance) {
            printTextarea("js: whisper initialized, instance: " + instance);
            printTextarea("Model loaded: " + model_whisper);
        }
    }

    if (!instance) {
        printTextarea("js: failed to initialize whisper");
        sendMessage({
            evt: "speech-recognition-error",
            msg: "failed to initialize whisper",
        });
        loaded = false;
        return;
    }

    if (!audio) {
        printTextarea("js: no audio data");
        return;
    }

    if (instance) {
        printTextarea("");
        printTextarea("js: processing - this might take a while ...");
        printTextarea("");
        sendMessage({
            evt: "speech-recognition-transforming",
        });
        setTimeout(function () {
            var ret = Module.full_default(instance, audio, "en", nthreads, translate);
            printTextarea("js: full_default returned: " + ret);
            if (ret) {
                printTextarea("js: whisper returned: " + ret);
            }
        }, 100);
    }
}
