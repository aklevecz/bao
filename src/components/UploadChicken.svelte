<script>
  import { isResponding, isThinking } from "$stores/chat";
  import { user as auth } from "$stores/user";

  /** @type {string}*/
  let chicken;
  /** @type {HTMLInputElement} */
  let fileinput;

  /**
   * @param {*} e
   */
  function onChickenSelected(e) {
    let chickenImage = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(chickenImage);
    /**
     * @param {*} e
     */
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const imgData = dataUrl.split(",")[1];
      chicken = dataUrl;
      isThinking.set(true);
      isResponding.set(true);
      await auth.login(imgData);
      isThinking.set(false);
      isResponding.set(false);
    };
  }
</script>

{#if chicken}
  <img class="w-20 h-20" src={chicken} alt="d" />
{:else}
  <img class="avatar" src="" alt="" />
{/if}

<button
  class="bg-green-400 w-60 py-2 rounded-full font-bold"
  on:click={() => {
    fileinput.click();
  }}
>
  upload your chicken 🍗
</button>
<div class="w-50 h-50 bg-red-500">
  <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e) => onChickenSelected(e)} bind:this={fileinput} />
</div>
