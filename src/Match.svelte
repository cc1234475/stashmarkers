<script lang="ts">
  import { OPTIONS } from "./utils";

  import { createEventDispatcher } from 'svelte';
  import type { Frame } from "./types";

	const dispatch = createEventDispatcher();

  export let frame: Frame;
  export let url = "";

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

  function scrubberMove(event) {
    let target = event.target;
    let imageWidth = 160;
    let left = 53;
    let right = 106;
    let backgroundPosition = target.style.backgroundPosition.split(" ");
    let offset = Number(target.getAttribute("data-offset").split(",")[0]);

    if (event.offsetX < left) {
      backgroundPosition[0] = `-${offset - imageWidth}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    } else if (event.offsetX > left && event.offsetX < right) {
      backgroundPosition[0] = `-${offset}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    } else if (event.offsetX > right) {
      backgroundPosition[0] = `-${offset + imageWidth}px`;
      target.style.backgroundPosition = backgroundPosition.join(" ");
    }
  }

  function scrubberReset(event) {
    let backgroundPosition = event.target.style.backgroundPosition.split(" ");
    let offset = Number(event.target.getAttribute("data-offset").split(",")[0]);
    backgroundPosition[0] = `-${offset}px`;
    event.target.style.backgroundPosition = backgroundPosition.join(" ");
  }
</script>

<div style="padding: 10px;">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="scrubber-item"
    on:click={() => {
      dispatch("select", frame);
    }}
    on:mousemove={scrubberMove}
    on:mouseleave={scrubberReset}
    style="background-position: -{frame.offset[0]}px -{frame
      .offset[1]}px; background-image: url('{url}');"
    data-offset={frame.offset}
  />
  <div class="progress" style="height: 5px">
    <div
      class="progress-bar progress-bar-striped bg-{confidence(frame.tag.prob)}"
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
        dispatch("addMarker", frame);
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
        <option style="background-color: var(--gray);" value={name}>{name}</option>
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
        dispatch("remove", frame.id);
      }}
      ><path
        d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
      /></svg
    >
  </span>
</div>

<style>
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
  svg {
    fill: #ffffff;
  }
</style>
