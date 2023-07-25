<script>
  import { chat, isThinking, isResponding } from "../store";
  import { afterUpdate, onMount } from "svelte";
  import { autoScroll } from "$lib/utils";
  import LoadingSpinner from "$components/LoadingSpinner.svelte";
  import Heart from "./svgs/Heart.svelte";
  import api from "$lib/api";

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

  let isTyping = false;
  /** @type {*} */
  let typewriter;
  let typedChar = "";
  let typedIndex = 0;

  /** @param {string} chat */
  function startTyping(chat, interval = 50) {
    if (typewriter) {
      clearInterval(typewriter);
    }
    function typeChar() {
      if (typedIndex < chat.length) {
        isTyping = true;
        typedChar += chat[typedIndex];
        typedIndex++;
      } else {
        /** This doesn't work because the typedChar gets cleared from every chunk
         * Need to find a way to type each chunk sequentially
         */
        typedIndex = 0;
        isTyping = false;
        typedChar = "";
        isResponding.set(false);
        clearInterval(typewriter);
        // @todo signal that typing as really stopped
      }
    }
    if (!isTyping) typewriter = setInterval(typeChar, interval);
  }
  let lastChatIndex = 0;
  let lastChat = { author: "", content: "", id: Symbol() };

  /** @typedef {('bao' | 'user')} Author*/
  /** @typedef {{id:symbol, content:string, author:Author}} Message - Message for the chat */
  /** @type {(Message | null)} */
  let secondToLast = null;
  // turning this shit off
  $: {
    if ($chat.length) {
      lastChatIndex = $chat.length - 1;
      lastChat = $chat[lastChatIndex];
      secondToLast = $chat[lastChatIndex - 1];
      // if it's the user chat then it is immediately typed

      //   startTyping(lastChat.content, lastChat.author === "bao" ? 10 : 2);
    }
  }

  /**
   * @param {{question:string, answer:string, id:symbol}} params
   */
  function saveAnswer({ question, answer, id }) {
    api.saveQuestion({ question, answer });
    liked = [...liked, id];
  }
</script>

<div bind:this={chatContainer} class="flex flex-col gap-3 text-white px-2 border-0 min-h-[200px] flex-[1_0_45%] overflow-scroll">
  <!-- {#each $chat.slice(0, $isResponding ? lastChatIndex : lastChatIndex + 1) as msg, index}
 -->
  {#each $chat as msg, index}
    <div class:user={msg.author === "user"} class="flex justify-normal items-center gap-2">
      <div class="chat_bubble">{msg.content.toLowerCase()}</div>
      {#if msg.author === "bao"}
        <button
          on:click={() =>
            saveAnswer({
              question: $chat[index - 1] ? $chat[index - 1].content : "no_question",
              answer: msg.content,
              id: msg.id,
            })}><Heart filled={liked.includes(msg.id)} /></button
        >{/if}
    </div>
  {/each}
  <div class:user={$chat[lastChatIndex].author === "user"} class="flex items-center">
    {#if $isResponding && false}<div class="chat_bubble">{typedChar}</div>{/if}
    <!-- {#if !$isThinking}
      <button
        on:click={() =>
          saveAnswer({
            question: secondToLast ? secondToLast.content : "_no_question_",
            answer: lastChat.content,
            id: lastChat.id,
          })}><Heart filled={liked.includes($chat[lastChatIndex].id)} /></button
      >{/if} -->
  </div>
  {#if $isThinking} <div><LoadingSpinner /></div>{/if}
</div>

<style>
  .chat_bubble {
    @apply bg-gray-700 p-2 rounded-md;
  }
  .user {
    @apply justify-end;
  }
  .user > .chat_bubble {
    @apply bg-red-400;
  }
</style>
