import AudioRecorder from "./components/AudioRecorder.vue";

const AudioRecorderVariable = {
 install(Vue) {
  // Let's register our component globally
  // https://vuejs.org/v2/guide/components-registration.html
  Vue.component("vue-audio-recorder-and-player", AudioRecorder);
 }
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(AudioRecorderVariable);
}

export default AudioRecorderVariable;