<script lang="ts">
  import {  getScenarioAndID, getUrlSprite, STASHMARKER_API_URL  } from "./utils";
  import Match from "./Matches.svelte";
  import type { Frame } from "./types";

  let scanner = false;

  async function download(url){
    const vblob = await fetch(url).then(res => res.blob());
    return new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(vblob);
    });
  }

  async function getMarkers() {
    scanner = true;
    const [, scene_id] = getScenarioAndID();
    let url = await getUrlSprite(scene_id);

    if (!url) {
      alert("No sprite found, please ensure you have sprites enabled and generated for your scenes.");
      scanner = false;
      return;
    }

    // get image blob
    let image = await download(url);

    // get vtt blob
    const vtt_url = url.replace("_sprite.jpg", "_thumbs.vtt");
    let vtt = await download(vtt_url);
    // query the api with a threshold of 0.4 as we want to do the filtering ourselves
    var data = {"data": [image, vtt, 0.4]};
    var requestDetails = {
      method: "POST",
      url: STASHMARKER_API_URL,
      data: JSON.stringify(data),
      headers: {"Content-Type": "application/json; charset=utf-8"},
      onload: function (response) {
        if (response.status !== 200) {
            scanner = false;
            alert("Something went wrong. It's likely a server issue, Please try again later.")
            return;
        }
        try {
          var data = JSON.parse(response.responseText);
        } catch (e) {
          alert("Error: " + response.responseText);
          return;
        }
        let frames: Frame[] = data.data[0]
        scanner = false;
        if (frames.length === 0) {
          alert("No tags found");
          return;
        }
        // find a div with class row
        let row = document.querySelector(".row");
        new Match({
            target: row,
            props: { frames: frames, url: url },
          });
      },
      onerror: function (response) {
        scanner = false;
        if (response.responseText == ""){
          alert("Error: Service may be down. please try again later.");
        }else{
          alert("Error: " + response.responseText);
        }
      },
    };
    GM_xmlhttpRequest(requestDetails);
  }
</script>

<button on:click={getMarkers} class:scanner>
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
</button>

<style>
  button {
    background-color: var(--nav-color);
    border: 0px;
  }

  .scanner {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--light);
    }

    70% {
      transform: scale(1.1);
      box-shadow: 0 0 0 10px var(--info);
    }

    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 var(--primary);
    }
  }
  svg {
    fill: #ffffff;
  }
</style>
