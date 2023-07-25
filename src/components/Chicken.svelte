<script>
  import { isElementInside } from "$lib/utils";
  import { chat } from "$stores/chat";
  import { game } from "$stores/game";
  import { user } from "$stores/user";
  import { onDestroy, onMount } from "svelte";

  /** @type {HTMLDivElement} */
  export let baoHeadRef;

  /** @type {HTMLButtonElement} */
  let chickenRef;

  /** chicken
   * @typedef {{x:number, y:number, xSpeed: number, ySpeed: number, radius: number}} Chicken
   */

  const SPEED = 1;
  /** @type {Chicken} */
  const chicken = {
    x: 0,
    y: 0,
    xSpeed: SPEED,
    ySpeed: SPEED,
    radius: 0,
  };

  let dragging = false;
  let chickenReceived = false;

  /** @type {number} */
  let frame;

  function moveChickenElement() {
    if (chickenRef) {
      chickenRef.style.left = `${chicken.x}px`;
      chickenRef.style.top = `${chicken.y}px`;
    }
  }

  function checkDirection() {
    if (chicken.x + chicken.radius >= window.innerWidth - chicken.radius / 2) {
      chicken.xSpeed = -chicken.xSpeed;
    }
    if (chicken.x <= 0 && chicken.xSpeed < 0) {
      chicken.xSpeed = -chicken.xSpeed;
    }
    if (chicken.y + chicken.radius >= window.innerHeight) {
      chicken.ySpeed = -chicken.ySpeed;
    }
    if (chicken.y <= 0 && chicken.ySpeed < 0) {
      chicken.ySpeed = -chicken.ySpeed;
    }
  }

  let lastFrameTimestamp = 0;

  const fps = 60; // Desired FPS, you can change this value
  const timeInterval = 1000 / fps;

  /** @param {number} timestamp */
  function animate(timestamp) {
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    const delta = timestamp - lastFrameTimestamp;
    if (delta > timeInterval && !dragging) {
      checkDirection();

      chicken.x += chicken.xSpeed;
      chicken.y += chicken.ySpeed;
      moveChickenElement();

      lastFrameTimestamp = timestamp;
    }

    frame = requestAnimationFrame(animate);
  }

  onMount(() => {
    const chickenWidth = chickenRef.getBoundingClientRect().width;
    chicken.radius = chickenWidth;
    chicken.x = chickenWidth;
    chicken.y = chickenWidth;
    if (frame) {
      cancelAnimationFrame(frame);
    }
    requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
  });

  function onClick() {
    console.log("clicked");
  }

  function onMouseDown() {
    dragging = true;
  }

  function onMouseUp() {
    dragging = false;
    lastTouch = null;
  }

  function chickenWinner() {
    game.catchChicken();
    user.incrementChickenTokens(100);
    chat.injectChat({ author: "bao", content: "mmm thanks! 😋" });
  }

  /** @type {*} */
  let lastTouch = null;
  /**
   * @param {*} e
   */
  function onMouseMove(e) {
    const isTouch = e.touches;
    if (isTouch) {
      const touch = e.touches[0];
      e.movementX = lastTouch ? touch.clientX - lastTouch.pageX : 0;
      e.movementY = lastTouch ? touch.clientY - lastTouch.pageY : 0;
      lastTouch = touch;
    }
    if (dragging) {
      chicken.x += e.movementX;
      chicken.y += e.movementY;
      moveChickenElement();

      const baoHasChicken = isElementInside(baoHeadRef, chickenRef);
      if (baoHasChicken && chickenReceived === false) {
        chickenReceived = true;
        chickenWinner();
      }
    }
  }
</script>

<button bind:this={chickenRef} on:click={onClick} on:mousedown={onMouseDown} on:touchstart={onMouseDown} class="chicken">🍗</button>
<svelte:window on:mouseup={onMouseUp} on:touchend={onMouseUp} on:mousemove={onMouseMove} on:touchmove={onMouseMove} />

<style>
  .chicken {
    position: absolute;
    font-size: 40px;
    cursor: pointer;
    z-index: 9;
  }
</style>
