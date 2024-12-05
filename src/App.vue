<template>
    <div>
        <!-- <iframe id="speech-recognition" style="border: 1px solid gray;"
            src="https://cqupthub.codeghub.com/project/common/speech-recognition/index.html" width="800" height="800"
            frameborder="0"></iframe> -->

        <!-- <iframe id="speech-recognition" style="border: 1px solid gray;"
            src="https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Ftd-resource.codeghub.com%2Fdev%2FeditorFile%2F9423b7bf-c452-4133-b973-fba7230b20b6%2Fattachment%2F476da8b05b3743b164ec40e6c0b3c98c74451333b79b45889288258c9aa80ab4.docx"
            width="800" height="800" frameborder="0"></iframe> -->

        <div>
            <div> 选择音频文件
                <input type="file" id="file" name="file" @change="loadAudio">
            </div>
            <div>选择音频文件2
                <input type="file" id="file" name="file" @change="loadAudio2">
            </div>
            <button @click="transform">语音转文字</button>
        </div>
        <div>识别结果：{{ text }}</div>
    </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
// import ImportedWorker from './worker/worker.js?worker&inline';

const kMaxAudio_s = 30 * 60;
const kMaxRecording_s = 2 * 60;
const kSampleRate = 16000;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.OfflineAudioContext =
    window.OfflineAudioContext || window.webkitOfflineAudioContext;
let context
//web worker
function loadAudio2(event) {
    if (!context) {
        context = new AudioContext({
            sampleRate: kSampleRate,
            channelCount: 1,
            echoCancellation: false,
            autoGainControl: true,
            noiseSuppression: true,
        });
    }

    let file = event.target.files[0] || null;
    if (file == null) {
        return;
    }


    let reader = new FileReader();
    reader.onload = function (event) {
        let buf = new Uint8Array(reader.result);

        context.decodeAudioData(
            buf.buffer,
            function (audioBuffer) {
                let offlineContext = new OfflineAudioContext(
                    audioBuffer.numberOfChannels,
                    audioBuffer.length,
                    audioBuffer.sampleRate
                );
                let source = offlineContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(offlineContext.destination);
                source.start(0);

                offlineContext.startRendering().then(function (renderedBuffer) {
                    let audio = renderedBuffer.getChannelData(0);

                    // console.log(renderedBuffer.getChannelData(0))
                    // truncate to first 30 seconds，只支持30s内的音频
                    if (audio.length > kMaxAudio_s * kSampleRate) {
                        audio = audio.slice(0, kMaxAudio_s * kSampleRate);
                        console.log(
                            "js: truncated audio to first " + kMaxAudio_s + " seconds"
                        );
                    }
                    window.SPEACH.postMessage({ evt: "speech-recognition-recognize", audioChannelData: renderedBuffer.getChannelData(0), id: 'test-id', language: 'en' })


                });
            },
            function (e) {
                console.log("js: error decoding audio: " + e);
                audio = null;
                // setAudio(audio);
            }
        );
    };
    reader.readAsArrayBuffer(file);
}

//iframe
function loadAudio(e) {
    let file = e.target.files[0] || null;
    if (file == null) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function (event) {
        let buf = new Uint8Array(reader.result);

        let recognition = document.getElementById("speech-recognition")


        recognition.contentWindow.postMessage({ evt: "speech-recognition-recognize", uint8Array: buf, id: 'test-id', language: 'en' }, "*")

    };
    reader.readAsArrayBuffer(file);
}

function transform() {
    window.SPEACH.postMessage({ evt: "speech-recognition-recognize", uint8Array: "buf", id: 'test-id', language: 'en' })
}
const text = ref("")
// let worker = null

// worker = new Worker(new URL('./worker.js', import.meta.url), {
//     type: 'classic'
//     //type: 'module' // es6
// })
// console.log(worker)

onMounted(() => {
    window.addEventListener("message", e => {
        let evt = e?.data?.evt
        let data = e?.data
        // console.log(data?.id)
        switch (evt) {
            case "speech-recognition-succeed": {
                text.value = e.data.text
                break
            }
            case "speech-recognition-err": {

                console.log(data.msg)
                break
            }

            case "speech-recognition-loading": {
                console.log(data.progress)
                break
            }
            case "speech-recognition-loaded": {
                console.log(data.loaded)
                break
            }
            case "speech-recognition-transforming": {
                console.log("transforming")
                break
            }
        }

    })
    window?.SPEACH.addEventListener("message", e => {
        let evt = e?.data?.evt
        let data = e?.data
        console.log(data?.id)
        switch (evt) {
            case "speech-recognition-succeed": {
                text.value = e.data.text
                break
            }
            case "speech-recognition-error": {

                console.log(data.msg)
                break
            }

            case "speech-recognition-loading": {
                console.log(data.progress)
                break
            }
            case "speech-recognition-loaded": {
                console.log(data.loaded)
                break
            }
            case "speech-recognition-transforming": {
                console.log("transforming")
                break
            }
        }

    })


})
onBeforeUnmount(() => {
    worker.terminate();
})
</script>