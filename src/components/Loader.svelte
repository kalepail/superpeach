<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    let className = {};
    export { className as class };

    let output = new Array(9).fill(0)
    let interval: NodeJS.Timeout

    randomize()

    onDestroy(() => {
        clearInterval(interval)
    })
    onMount(() => {
        interval = setInterval(randomize, 100)
    })

    function randomize() {
        output = output.map(() => Math.random() > 0.5 ? 1 : 0)
    }
</script>

<div class={className + ` inline-flex flex-wrap w-[15px] h-[15px]`}>
    {#each output as dot}
        <div class="w-[5px] h-[5px] {dot ? 'bg-black' : 'bg-white'} transition-colors"></div>
    {/each}
</div>