<script>
  export let chat = "";
  let typedIndex = 0;
  let typedChar = "";
  let isTyping = false;
  /** @type {number} */
  let typewriter;

  /** @param {string} chat */
  function startTyping(chat) {
    function typeChar() {
      if (typedIndex < chat.length) {
        isTyping = true;
        typedChar += chat[typedIndex];
        typedIndex++;
      } else {
        isTyping = false;
        clearInterval(typewriter);
      }
    }
    typewriter = setInterval(typeChar, 10);
  }

  $: {
    typedChar = "";
    typedIndex = 0;
    startTyping(chat);
  }

  $: {
    console.log("IS TYPEING:", isTyping);
  }
</script>

<div class="text-green-500">{typedChar}</div>
