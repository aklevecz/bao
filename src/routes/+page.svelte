<script>
  import { dev } from "$app/environment";
  import { scale } from "svelte/transition";

  import { chat, isLoaded, isResponding, isThinking } from "$stores/chat";
  import { game } from "$stores/game.js";
  import { user } from "$stores/user";
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { spring } from "svelte/motion";

  import Button from "$components/Button.svelte";
  import Chat from "$components/Chat.svelte";
  import Chicken from "$components/Chicken.svelte";
  import ChickenTokenCounter from "$components/ChickenTokenCounter.svelte";
  import Dogging from "$components/icons/Dogging.svelte";
  import Thinking from "$components/icons/Thinking.svelte";
  import Paw from "$components/svgs/Paw.svelte";

  import baoHead from "$lib/assets/bao.png";

  let isFocused = false;

  /** @type {HTMLDivElement}*/
  let baoHeadRef;
  /** @type {HTMLInputElement} */
  let inputEl;

  /** @type { number}*/
  let inputWidthDim = 100;
  /** @type {import("svelte/motion").Spring<number>}*/
  let inputWidth = spring(inputWidthDim, {
    stiffness: 0.05,
    damping: 0.25,
  });

  /** @type { number}*/
  let inputHeightDim = 100;
  /** @type {import("svelte/motion").Spring<number>}*/
  let inputHeight = spring(inputHeightDim, {
    stiffness: 0.05,
    damping: 0.25,
  });

  let question = "";
  function onGo() {
    chat.submit(question.trim().toLowerCase());
    question = "";
  }
  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    if (event.key === "Enter") {
      onGo();
      inputEl.blur();
    }
  }

  function onClick() {
    inputWidth.set(window.innerWidth < 768 ? window.innerWidth - 50 : 600);
    inputHeight.set(50);
  }

  function onFocus() {
    isFocused = true;
  }

  function onBlur() {
    // inputWidth.set(inputWidthDim);
    // question = "";
    isFocused = false;
  }

  afterUpdate(() => {
    if (!$isResponding && inputEl) {
      // if (window.innerWidth > window.innerHeight) inputEl.focus();
      if (dev) inputEl.focus();
    }
  });

  /** @type {*} */
  let unsub;
  onMount(() => {
    if (!unsub) {
      unsub = user.listener();
    }
    if (window.innerWidth > 768) {
      inputWidthDim = 100;
      inputWidth.set(inputWidthDim);
    }
  });

  onDestroy(() => {
    if (unsub) {
      unsub();
    }
  });
</script>

<div class="font-bold relative text-secondary p-4 tracking-widest text-3xl">
  {#if $isThinking} <Thinking />{/if}
  {#if $user.authed}<ChickenTokenCounter />{/if}
  <!-- <div class="bao-head-container flex justify-center fixed w-full"> -->
  <div>
    <img bind:this={baoHeadRef} class="fixed bao-head w-20 h-20 m-auto -ml-10" alt="BAO" src={baoHead} />
  </div>
  <!-- </div> -->
</div>
{#if $user.loading || !$isLoaded}<div
    class="flex flex-col items-center text-5xl gap-3 justify-center h-2/3 min-h-[300px] mix-blend-difference font-bold text-black bg-red-500 rounded-full"
  >
    <Dogging />LOADING...
  </div>{/if}
{#if !$user.loading && $isLoaded}<Chat {isFocused} />{/if}
{#if $isLoaded}<div class="flex justify-between items-center gap-3 pt-3">
    <div
      class="chat-input-container relative m-auto bg-white w-full flex p-[8px]"
      class:open={$inputWidth !== inputWidthDim}
      style={`width:${$inputWidth}px;height:${$inputHeight}px`}
    >
      {#if $inputWidth === inputWidthDim}<div class="chat-icon">💬</div>{/if}
      <input
        class="bg-transparent text-[#e199ff] px-2 py-1 flex-1 rounded-none"
        bind:value={question}
        bind:this={inputEl}
        on:click={onClick}
        on:blur={onBlur}
        on:keydown={onKeyDown}
        on:focus={onFocus}
        disabled={$isResponding}
      />
      {#if question}
        <div in:scale out:scale>
          <Button disable={$isResponding} variant="secondary" class="h-[40px] w-[40px]" on:click={onGo}>
            <Paw />
          </Button>
        </div>
      {/if}
    </div>
    {#if $user.authed && !$game.caughtChicken && $user.chicken_tokens === 0 && $isLoaded}<Chicken {baoHeadRef} />{/if}
  </div>{/if}

<style>
  .chat-input-container {
    background-color: #00feed;
    @apply rounded-full;
  }
  .chat-input-container.open {
    /* height: 70px; */
  }
  .chat-icon {
    position: absolute;
    left: 20%;

    top: 5px;
    font-size: 56px;
    pointer-events: none;
  }
  .bao-head {
    animation: tripout 30000ms infinite alternate;
    left: calc(100vw / 2);
    opacity: 0.8;
    z-index: 9;
  }

  @keyframes tripout {
    0% {
      filter: saturate(5.5) hue-rotate(0deg);
    }
    100% {
      filter: saturate(5.5) hue-rotate(360deg);
    }
  }

  @media (min-width: 768px) {
    .chat-input-container {
      /* width: 100px;
      height: 100px; */
    }
    .chat-icon {
      font-size: 50px;
      top: 10px;
    }
  }
</style>
