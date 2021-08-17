let sumBtn = document.getElementById("sumBtn");
let result = document.getElementById("resultDiv");
let mdlSlc = document.getElementById("modelSelect");
const modelList = ["KoBertSum", "MatchSum", "SummaRuNNer", "TextRank", "LexRank"];
class HTTPError extends Error{};

// When the button is clicked, call api with url of current tab 
sumBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs =>{
    
    //load selected model
    model = mdlSlc.options[mdlSlc.selectedIndex].value;
    //calling api with fetch()
    const URL_TO_API = "http://112.175.32.78:443";
    
    let keyword = tabs[0].url;
    let url;
    if (keyword.startsWith("https://n.news.naver.com/")) {
      const startsurl = keyword.split('?')[0].split("/");
      const oid = startsurl[startsurl.length - 2];
      const aid = startsurl[startsurl.length - 1];
      url = `https://news.naver.com/main/read.naver?oid=${oid}&aid=${aid}`;
    }else{
      url = keyword;
    }
    
    let requestOpt = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        url: url,
      })
    }
    
    let loadImg = document.createElement("img");
    loadImg.src = "https://i0.wp.com/emoji.gg/assets/emoji/3339_loading.gif";
    loadImg.width = 10; loadImg.height = 10;
    result.insertBefore(loadImg, result.firstChild);

    fetch(URL_TO_API + "/api/original_text", requestOpt).then(response => {
      if(response.ok){
        return response.json();
      } else {
        throw new HTTPError(`Response: ${response.statusText}`);
      }
    }).then(jsons => {
      
      let textli = jsons["text"];
      if(textli.length==1 && textli[0] == "body"){
        //occurs when orig_txt api responses {"text"=["body"]}
        throw new Error("Failed to find original text. It might be an unsupported page.");
      }

      chrome.storage.sync.get("topk", ({ topk }) => {
        let number = topk * 1;
        console.log("top" + String(number) + " sent selected");
        
        if(model == "MatchSum"){
          number = 1;
        }
        
        let requestOpt = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
          },
          body: JSON.stringify({
            text: textli,
            topk: number, 
            sort: "sent",
          })
        };
    
        apiURL = URL_TO_API + "/api/" + model;
        
        console.log(apiURL);
        fetch(apiURL, requestOpt).then(response => {
          if(response.ok){
            return response.json();
          }else{
            throw new HTTPError(`Response: ${response.statusText}`);
          }
        }).then(jsons => {
          console.log(jsons["summary"]);

          let sumidx = jsons["summary"];
          if( !Array.isArray(sumidx)){
            //text is too short error
            throw new Error(`Summarizing failed: ${sumidx}`);
          }
          else{
            result.textContent='';//clear resultDiv
            if(model == "MatchSum"){
              sumidx = jsons["summary"][0];
            }
            
            for (let i of sumidx){
              let newP = document.createElement("p");
              newP.innerHTML = textli[i];
              result.appendChild(newP);
            }
          }

        }).catch(error => {
          console.log("error from model api");
          result.innerHTML= `<p>${error}</p>`;
        });
      });
      
    }).catch(error => {
      console.log("Error from preprocessing api.\n"+error);
      if (error instanceof HTTPError || error instanceof TypeError){
        result.innerHTML=`<p>Connection failed. Detail below.<br> >> ${error}</p>`;
      }else{
        result.innerHTML= `<p>${error}</p>`;
      }
    }).then(()=>{
      //change to selected model
      mdlIdx = modelList.indexOf(model);
          console.log("model set to " + String(mdlIdx));
          chrome.storage.sync.set({ mdlIdx });
    });

  });
  
});

window.onload = function() {
  console.log("onload" + Date())
  //load last-selected model
  chrome.storage.sync.get("mdlIdx", ({ mdlIdx }) => {
    mdlSlc.options[mdlIdx].setAttribute("selected", "selected");
    console.log(mdlSlc.options[mdlIdx].value + " selected");
  });
  //no need to click btn at first
  sumBtn.click();
}

document.getElementById("OptionSettingBtn").onclick = ()=>{
  chrome.runtime.openOptionsPage();
};