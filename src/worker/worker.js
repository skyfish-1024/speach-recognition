// import "./helpers";
// import "./app";
// import "./main";
var audioId = "";
var loaded = false;
function sendMessage(data) {
    self.postMessage({ ...data, id: audioId });
}
self.importScripts("./helpers.js", "./app.js", "./main.js");
loadWhisper("tiny", "./whisper-tiny.bin");
self.addEventListener("message", function (e) {
    const data = e?.data;
    const evt = e?.data?.evt;

    switch (evt) {
        //文字转语音事件
        case "speech-recognition-recognize": {
            if (!data?.id) {
                console.error("no valid id");
                sendMessage({
                    evt: "speech-recognition-err",
                    msg: "no valid id",
                });
                return;
            }
            if (!data?.audioChannelData) {
                console.error("no valid audio data (expect Uint8Array)");
                sendMessage({
                    evt: "speech-recognition-err",
                    msg: "no valid audio data (expect Uint8Array)",
                });
                return;
            }
            audioId = data?.id;
            language = data.language || "en";
            sendMessage({
                evt: "speech-recognition-transforming",
            });

            loadAudioFromUint8Array(data.audioChannelData);
        }
        //服务是否准备就绪时间
        case "speech-recognition-loaded": {
            sendMessage({
                evt: "speech-recognition-loaded",
                loaded: loaded,
            });
            break;
        }
    }
});
