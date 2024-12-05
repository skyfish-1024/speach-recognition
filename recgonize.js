//初始化模型
function printTextarea() {
    console.log(...arguments);
}
var Module = {
    print: printTextarea,
    printErr: printTextarea,
    setStatus: function (text) {
        printTextarea("js: " + text);
    },
    monitorRunDependencies: function (left) {},
};

var model_whisper = "";

// helper function
function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

function loadWhisper(model) {
    let urls = {
        "tiny.en": "https://whisper.ggerganov.com/ggml-model-whisper-tiny.en.bin",
        tiny: "https://whisper.ggerganov.com/ggml-model-whisper-tiny.bin",
        "base.en": "https://whisper.ggerganov.com/ggml-model-whisper-base.en.bin",
        base: "https://whisper.ggerganov.com/ggml-model-whisper-base.bin",
        "small.en": "https://whisper.ggerganov.com/ggml-model-whisper-small.en.bin",
        small: "https://whisper.ggerganov.com/ggml-model-whisper-small.bin",

        "tiny-en-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-tiny.en-q5_1.bin",
        "tiny-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-tiny-q5_1.bin",
        "base-en-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-base.en-q5_1.bin",
        "base-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-base-q5_1.bin",
        "small-en-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-small.en-q5_1.bin",
        "small-q5_1": "https://whisper.ggerganov.com/ggml-model-whisper-small-q5_1.bin",
        "medium-en-q5_0": "https://whisper.ggerganov.com/ggml-model-whisper-medium.en-q5_0.bin",
        "medium-q5_0": "https://whisper.ggerganov.com/ggml-model-whisper-medium-q5_0.bin",
        "large-q5_0": "https://whisper.ggerganov.com/ggml-model-whisper-large-q5_0.bin",
    };

    let sizes = {
        "tiny.en": 75,
        tiny: 75,
        "base.en": 142,
        base: 142,
        "small.en": 466,
        small: 466,

        "tiny-en-q5_1": 31,
        "tiny-q5_1": 31,
        "base-en-q5_1": 57,
        "base-q5_1": 57,
        "small-en-q5_1": 182,
        "small-q5_1": 182,
        "medium-en-q5_0": 515,
        "medium-q5_0": 515,
        "large-q5_0": 1030,
    };

    let url = urls[model];
    let dst = "whisper.bin";
    let size_mb = sizes[model];

    model_whisper = model;

    cbProgress = function (p) {
        let el = document.getElementById("fetch-whisper-progress");
        el.innerHTML = Math.round(100 * p) + "%";
    };

    cbCancel = function () {};

    loadRemote(url, dst, size_mb, cbProgress, storeFS, cbCancel, printTextarea);
}

export default function initModel() {}
