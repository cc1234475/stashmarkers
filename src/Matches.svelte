<script lang="ts">
  import Match from './Match.svelte';

  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { createMarker, getAllTags, createTag, getScenarioAndID } from "./utils";

  import { onMount } from "svelte";
  import type { Frame } from "./types";

  export let url = "";
  export let frames: Frame[] = [];
  export let threshold = 0.4;

  let tags;
  let self;
  let selected = null;
  let saving = false;

  onMount(async () => {
    tags = await getAllTags();
    threshold = Number(localStorage.getItem('stash-marker-threshold')) || 0.4;
  });

  function getCurrentVideo(): HTMLVideoElement {
    return document.querySelector("#VideoJsPlayer_html5_api");
  }

  $: filteredFrames = frames.filter((x) => x.tag.prob > threshold);

  async function close() {
    self.remove();
  }

  function select(event) {
    let frame = event.detail;
    if (selected === frame.id) {
      selected = null;
    } else {
      selected = frame.id;
      playVideoAtTime(frame.time);
    }
  }

  async function playVideoAtTime(time) {
    const video = getCurrentVideo();
    await video.play();
    video.currentTime = time;
  }

  async function remove(id) {
    frames = frames.filter((x) => x.id !== id);
  }

  async function addMarker(frame) {
    const [, scene_id] = getScenarioAndID();

    let time;
    const tagLower = frame.tag.label.toLowerCase();

    if (tags[tagLower] === undefined) {
      const tagID = await createTag(tagLower);
      tags[tagLower] = tagID;
    }
    
    let tagId = tags[tagLower];

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
    selected = null;
    saving = true;
    filteredFrames.forEach(async (frame) => {
      await addMarker(frame);
    });
    saving = false;
    window.location.reload();
    close();
  }
</script>

<div bind:this={self} class="tagger-tabs">
  <div class="modal-dialog modal-xl top-accent">
    <div class="modal-content">
      <div class="modal-header">
        Threshold: <input
          type="range"
          min="0.4"
          max="0.9"
          step="0.1"
          bind:value={threshold}
          on:change={() => {localStorage.setItem("stash-marker-threshold", String(threshold))}}
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
              animate:flip={{duration: 250, easing: quintOut }}
            >
              <Match bind:frame={frame} {url} on:addMarker={(event) => {addMarker(event.detail)}} on:remove={(event) => {remove(event.detail)}} on:select={select} />
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
</style>