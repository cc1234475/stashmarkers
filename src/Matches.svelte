<script lang="ts">
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { OPTIONS, createMarker, getAllTags, getScenarioAndID } from "./utils";

  import { onMount } from "svelte";
  import type { Frame } from "./types";

  export let url = "";
  export let frames: Frame[] = [];
  export let threshold = 0.4;

  let tags;
  let self;
  let selected;
  let saving = false;

  onMount(async () => {
    tags = await getAllTags();
    threshold = Number(localStorage.getItem('stash-marker-threshold')) || 0.4;
  });

  function getCurrentVideo(): HTMLVideoElement {
    return document.querySelector("#VideoJsPlayer_html5_api");
  }

  async function playVideoAtTime(time) {
    const video = getCurrentVideo();
    video.currentTime = time;
    video.play();
  }

  function confidence(prob) {
    prob = prob * 100;

    if (prob < 50.0) {
      return "danger";
    } else if (prob < 75.0) {
      return "warning";
    } else {
      return "success";
    }
  }

  $: filteredFrames = frames.filter((x) => x.tag.prob > threshold);

  async function close() {
    self.remove();
  }

  function select(frame) {
    if (selected === frame.id) {
      selected = null;
    }else{
      selected = frame.id;
      playVideoAtTime(frame.time);
    }
  }

  function remove(id) {
    frames = frames.filter((x) => x.id !== id);
  }

  async function addMarker(frame) {
    const [, scene_id] = getScenarioAndID();

    let time;
    let tagId = tags[frame.tag.label];

    if (selected && selected === frame.id) {
      const video = getCurrentVideo();
      time = video.currentTime;
    } else {
      time = frame.time;
    }
    await createMarker(scene_id, tagId, time);
    remove(frame.id);
    selected = null;
  }

  function saveAll() {
    saving = true;
    frames.forEach(async (frame) => {
      await addMarker(frame);
    });
    saving = false;
    close();
  }

  function changeThreshold() {
    localStorage.setItem("stash-marker-threshold", String(threshold));
  }
</script>

<div bind:this={self} class="tagger-tabs">
  <div class="modal-dialog modal-xl top-accent">
    <div class="modal-content">
      <div class="modal-header">
        Threshold: <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          bind:value={threshold}
          on:change={changeThreshold}
          id="stash-tag-threshold"
          style="margin: 0px; height: 10px;"
        />
        {threshold * 100} %
      </div>
      <div class="modal-body">
        <div class="row justify-content-center">
          {#each filteredFrames as frame (frame.id)}
            <div
              class:selected={selected === frame.id}
              out:fade
              in:fade
              animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
            >
              <div style="padding: 10px;">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="scrubber-item"
                  on:click={() => {select(frame)}}
                  style="background-position: -{frame.offset[0]}px -{frame
                    .offset[1]}px; 
                         background-image: url(&quot;{url}&quot;);"
                />
                <div class="progress" style="height: 5px">
                  <div
                    class="progress-bar progress-bar-striped bg-{confidence(
                      frame.tag.prob
                    )}"
                    role="progressbar"
                    style="width: {frame.tag.prob * 100}%"
                    aria-valuenow={frame.tag.prob * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span class="tag-item badge badge-secondary">
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    style="padding-right: 10px; display: inline;"
                    on:click|once={() => {
                      addMarker(frame);
                    }}
                  >
                    <svg
                      class="tag-item-accept"
                      xmlns="http://www.w3.org/2000/svg"
                      height="1em"
                      viewBox="0 0 512 512"
                      ><path
                        d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"
                      /></svg
                    >
                  </div>
                  <select
                    bind:value={frame.tag.label}
                    style="color: #f5f8fa"
                    class="tag-item-select"
                  >
                    {#each OPTIONS as name}
                      <option style="color: #f5f8fa" value={name}>{name}</option
                      >
                    {/each}
                  </select>
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    focusable="false"
                    class="tag-item-reject"
                    on:click|once={() => {
                      remove(frame.id);
                    }}
                    ><path
                      d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                    /></svg
                  >
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="ModalFooter modal-footer">
        <div>
          <button
            id="tags-cancel"
            type="button"
            on:click={close}
            class="ml-2 btn btn-secondary">Close</button
          >
          <button id="tags-accept" type="button" class="ml-2 btn btn-primary" on:click={saveAll}>
            {#if saving}
              <div class="lds-dual-ring" />
            {/if}
            Add All Tags</button
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-header {
    font-size: 1rem;
    border-bottom: 0px;
    padding: 20px;
  }

  .modal-footer {
    border-top: 0px;
  }

  .tag-item {
    background-color: var(--card-color);
    width: 100%;
    padding: 5px;
    margin: 0px;
  }
  .tag-item-accept:hover {
    fill: #45a82c;
    transition: fill 0.2s ease-out;
  }
  .tag-item-reject:hover {
    fill: #a82c2c;
    transition: fill 0.2s ease-out;
  }
  .tag-item-select {
    border: none;
    outline: none;
    scroll-behavior: smooth;
  }
  .scrubber-item {
    width: 160px;
    height: 90px;
    border-radius: 5px 5px 0px 0px;
    position: relative;
    cursor: pointer;
  }
  .selected {
    border: 2px solid #007bff;
  }
  .tagger-tabs {
    position: absolute;
    flex: 0 0 450px;
    max-width: 450px;
    min-width: 450px;
    height: 100%;
    overflow: auto;
    order: -1;
    background-color: var(--body-color);
  }
  svg {
    fill: #ffffff;
  }

</style>
