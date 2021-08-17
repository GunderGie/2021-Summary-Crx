document.addEventListener('input',(e)=>{
    if(e.target.getAttribute('name')=="topkRadios"){
        console.log(e.target.value);
        topk = e.target.value;
        chrome.storage.sync.set({ topk });

        let saveMsg = document.getElementById("saveMsg");
        saveMsg.textContent = '';
        let newMsg = document.createElement("div");
        newMsg.style.color = '#2745f2';
        newMsg.textContent = "적용되었습니다."
        saveMsg.appendChild(newMsg);
        setTimeout(() => newMsg.style.color = 'black', 10);

    }
});

window.onload = function() {
    console.log("onload" + Date())
    //load last-selected topk
    chrome.storage.sync.get("topk", ({ topk }) => {
        let topkRadio = document.getElementById("top"+String(topk));
        topkRadio.setAttribute("checked", "checked");
        console.log(topkRadio.value + " checked");
    });
}

let closeBtn = document.getElementById("closeBtn");
closeBtn.addEventListener("click",  () => {
    window.close();
});