<script>
  // this just renders the chat and handles liking chats
  import api from "$lib/api";
  import { autoScroll, removeTokensFromMessage } from "$lib/utils";
  import { chat, isThinking } from "$stores/chat";
  import { authStates } from "$lib/constants";
  import { user } from "$stores/user";
  import { afterUpdate, onMount } from "svelte";
  import UploadChicken from "./UploadChicken.svelte";
  import Chatting from "./icons/Chatting.svelte";
  import Paint from "./icons/Paint.svelte";
  import Tv from "./TV.svelte";

  export let isFocused = false;
  /** @type {symbol[]} liked */
  let liked = [];
  /** @type {HTMLDivElement} */
  let chatContainer;

  onMount(() => {
    autoScroll(chatContainer);
  });

  afterUpdate(() => {
    autoScroll(chatContainer);
  });

  // turning this shit off
  /**
   * @param {{question:string, answer:string, id:symbol}} params
   */
  function saveAnswer({ question, answer, id }) {
    api.saveQuestion({ question, answer });
    liked = [...liked, id];
  }

  /**
   *
   * @param {string} image
   */
  function onDownload(image) {
    var a = document.createElement("a");
    a.href = "/api/proxy?proxythis=" + encodeURIComponent(image);
    a.download = "output.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // @tocode
    // if has not caught chicken
    // add blurb about catching the floating chicken

    // @ref CHAT_INJECTION
    chat.injectChat({
      content: `welcome ${$user.user.chicken_name}! you are signed in! hey ummm can you help me grab that chicken floating around? i'm hungry af!`,
      author: "bao",
    });
  }
  $: console.log($user);
</script>

<!-- FOCUS EFFECT TO PUSH DOWN CHAT <div
  bind:this={chatContainer}
  class:is-focused={isFocused}
  class="flex flex-col gap-3 text-white px-2 border-0 min-h-[200px] flex-[1_0_45%] overflow-scroll overflow-x-hidden pt-[80px] md:pt-[120px]"
> -->
{#if $user.watchTV}
  <Tv />
{/if}
<div
  bind:this={chatContainer}
  class="flex flex-col gap-3 text-white px-2 border-0 max-w-3xl m-auto min-h-[200px] flex-[1_0_45%] overflow-scroll overflow-x-hidden pt-[80px] md:pt-[120px]"
>
  {#each $chat as msg, index}
    <div class:user={msg.author === "user"} class="flex justify-normal items-center gap-2">
      <div class="block max-w-[85%]">
        <!-- <div>{JSON.stringify(msg)}</div> -->
        <!-- <div class="chat_bubble">{removeTokensFromMessage(msg.content)}</div> -->
        <div class="chat_bubble">{msg.content}</div>

        {#if msg.image}<div class="relative flex flex-col gap-2">
            <img
              id="img"
              src={`/api/proxy?proxythis=${encodeURIComponent(msg.image)}`}
              on:load={() => {
                autoScroll(chatContainer);
              }}
              alt="this should be a chicken drawing"
            />
            <button
              class="bg-green-400 w-40 m-auto py-2 rounded-full font-bold"
              on:click={() => {
                if (msg.image) {
                  onDownload(msg.image);
                }
              }}>🌀 download</button
            >
          </div>{/if}
      </div>
      <!-- {#if msg.author === "bao" && index}
        <button
          on:click={() =>
            saveAnswer({
              question: $chat[index - 1].content,
              answer: msg.content,
              id: msg.id,
            })}><Heart filled={liked.includes(msg.id)} /></button
        >{/if} -->
    </div>
  {/each}
  {#if $user.authState === authStates.uploadingChicken}
    <UploadChicken />{/if}
  {#if $isThinking} <div><Chatting /></div>{/if}
  {#if $user.authState === authStates.drawingChicken}<Paint />{/if}
</div>

<style>
  .chat_bubble {
    @apply p-2 rounded-md;
    background-color: #6462ff;
  }
  .user {
    @apply justify-end;
  }
  .user .chat_bubble {
    color: rgb(225 153 255);
    font-weight: bold;
    background-color: #00feed;
  }
  @media (max-width: 768px) {
    .is-focused {
      justify-content: center;
    }
  }
</style>
