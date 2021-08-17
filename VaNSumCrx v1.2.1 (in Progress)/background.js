let mdlIdx = 0;//default: KoBertSum
let topk = 3;//default: top3 sents

chrome.runtime.onInstalled.addListener(() => {
    console.log('Default set to top'+ String(topk) + ' sents from model ' + String(mdlIdx));
    chrome.storage.sync.set({ mdlIdx });
    chrome.storage.sync.set({ topk });
});
