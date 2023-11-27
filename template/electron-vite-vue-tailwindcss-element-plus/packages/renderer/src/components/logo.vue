<template>
  <div class="header-logo">
    <div class="logo">
      <div class="box">UP</div>
      <div class="text"><span class="first">UPTMR</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Logo',
};
</script>

<style scoped>
/* region logo css start */
.logo {
  width: 230px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0 auto 0 auto;
  user-select: none;
}
.box {
  width: 47px;
  height: 45px;
  padding-right: 4px;
  border-radius: 10px;
  background: #3773fd;
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  line-height: 45px;
  text-align: center;
  font-style: italic;
  z-index: 2;
  animation: test 2s;
  position: relative;
}
.box:after {
  content: '';
  display: block;
  top: 8px;
  right: -15px;
  position: absolute;
  height: 30px;
  width: 1px;
  background: #000;
  margin: auto;
  animation: expand 2s;
}
.text {
  height: 60px;
  color: #fff;
  padding-left: 30px;
  line-height: 60px;
  font-size: 24px;
  letter-spacing: 3px;
  font-weight: 800;
  animation: fade 2.5s;
}
.first {
  color: #000000;
}
@keyframes expand {
  0% {
    height: 0;
  }
  40% {
    height: 0;
  }
  60% {
    height: 80%;
  }
}
@keyframes test {
  0% {
    transform: scale(0);
    left: 39%;
  }
  40% {
    transform: scale(0);
    left: 39%;
  }
  80% {
    transform: scale(1);
    left: 39%;
  }
  100% {
    left: 0%;
  }
}
@keyframes fade {
  0% {
    opacity: 0;
  }
  65% {
    opacity: 0;
    padding-left: 15px;
  }
  100% {
    opacity: 1;
    padding-left: 30px;
  }
}
/* endRegion logo css end */
</style>
