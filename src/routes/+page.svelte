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
  import { urlB64ToUint8Array } from "$lib/utils";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import { goto } from "$app/navigation";

  let isFocused = false;

  /** @type {HTMLDivElement}*/
  let baoHeadRef;
  /** @type {HTMLInputElement} */
  let inputEl;

  /** @type { number}*/
  let inputWidthDim = 80;
  /** @type {import("svelte/motion").Spring<number>}*/
  let inputWidth = spring(inputWidthDim, {
    stiffness: 0.05,
    damping: 0.25,
  });

  /** @type { number}*/
  let inputHeightDim = 80;
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
      inputWidthDim = 80;
      inputWidth.set(inputWidthDim);
    }
  });

  onDestroy(() => {
    if (unsub) {
      unsub();
    }
  });

  async function onSubscribe() {
    const result = await Notification.requestPermission();
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return;
    }
    const subscribed = await registration.pushManager.getSubscription();
    if (subscribed) {
      console.info("User is already subscribed.", subscribed);
      // notifyMeButton.disabled = false;
      // unsubscribeButton.disabled = false;
      // return;
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(PUBLIC_VAPID_KEY),
    });
    fetch("/api/subscription/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
  }

  async function onNotifyMe() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return;
    }
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return;
    }
    fetch("api/notify/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }

  /** @type {any} */
  let deferredPrompt
  onMount(() => {
        window.addEventListener("beforeinstallprompt", (e) => {
          alert("beforeinstallprompt");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      // setInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      // Log install to analytics
      console.log('INSTALL: Success');
    });

  })

  /** @param {MouseEvent} e */
    const handleInstallClick = (e) => {
      // Hide the app provided install promotion
      // setInstallable(false);
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((/** @type {any}*/choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      });
  };
  // the purple color: #e199ff
</script>
          <button class="install-button" on:click={handleInstallClick}>
            INSTALL ME
          </button>
<div class="font-bold relative text-secondary p-4 tracking-widest text-3xl">
  {#if $isThinking}
    <Thinking />{/if}
  {#if $user.authed}<ChickenTokenCounter />{/if}
  <!-- <div class="bao-head-container flex justify-center fixed w-full"> -->
  <div>
    <img bind:this={baoHeadRef} class="fixed bao-head w-20 h-20 m-auto -ml-10" alt="BAO" src={baoHead} />
  </div>
  <!-- </div> -->
  <!-- <div class="flex"> -->
    <!-- <div class="flex items-center justify-center bg-[#fff] rounded-full w-14 h-14"> -->
      <!-- <button class="inverted-icon-outline" on:click={onSubscribe}>🔔</button> -->
      <!-- <button on:click={onNotifyMe}>notify me</button> -->
    <!-- </div> -->
  <!-- </div> -->
    <div class="flex max-w-3xl m-auto">
    <div class="flex items-center justify-center bg-[#fff] rounded-full w-14 h-14">
      <button class="rounded-full" on:click={() =>{
        goto("/gallery");
      }}><img class="rounded-full" src="/chicken-icon.png" alt="chicken"/></button>
    </div>
  </div>
</div>
{#if $user.loading || !$isLoaded}<div class="flex flex-col items-center text-5xl gap-3 justify-center h-2/3 min-h-[300px] mix-blend-difference font-bold text-black bg-red-500 rounded-full">
    <Dogging />LOADING...
  </div>{/if}
{#if !$user.loading && $isLoaded}<Chat {isFocused} />{/if}
{#if $isLoaded}<div class="flex justify-between items-center gap-3 pt-3">
    <div class="chat-input-container relative m-auto bg-white w-full flex p-[8px]" class:open={$inputWidth !== inputWidthDim} style={`width:${$inputWidth}px;height:${$inputHeight}px`}>
      {#if $inputWidth === inputWidthDim}<div class="chat-icon">💬</div>{/if}
      <input
        class="bg-transparent text-[#000] px-2 py-1 flex-1 rounded-none font-bold"
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
          <Button disable={$isResponding} variant="secondary" class="h-[100%] w-[40px]" on:click={onGo}>
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
    background-color: #fff;
    @apply rounded-full;
  }
  .chat-input-container.open {
    height: 70px;
  }
  .chat-icon {
    position: absolute;
    left: 20px;
    top: 13px;
    font-size: 36px;
    cursor: pointer;
    pointer-events: none;
    filter: brightness(0) invert(1);
    mix-blend-mode: difference;
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
    .inverted-icon-outline {
      filter: brightness(0) invert(1);
      mix-blend-mode: difference;
    }
  }
</style>
