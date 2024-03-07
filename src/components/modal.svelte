<script>
import { state } from '$lib/stores/model.js'

const clear = () => {
    $state.modal = false
}

</script>   
<div class="modal">
    <div class="content">
        <div class="grey-back">
            <button class="close" on:click={clear}><img src="/x-circle.svg" alt="close"/></button>
        </div>
        <h1 class="text-center margin-y large">{$state.modal}</h1>
        <p class="text-center margin-y"><button class="button" on:click={clear}>Got It</button></p>
    </div>
</div>
<style>

.modal {
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    position: fixed;
    background-color: rgba(0,0,0,.7);
    padding-top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content {
    width: 95vw;
    max-width: 400px;
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    overflow: hidden;
}

.margin-y {
    margin: 24px 0;
}

.large {
    font-size: 16px;
    color: #333;
}

.button {
    padding: 0 24px;
}

.text-center {
    text-align: center;
}

.grey-back {
    background: #eee;
    padding: 12px 12px 6px;
    text-align: right;
}

</style>