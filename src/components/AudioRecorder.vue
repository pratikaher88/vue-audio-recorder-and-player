<template>

<div class="container">

    <p v-if="error" class="grey--text">{{ error }}</p>
	<audio id="recorder" ref="recorderaudio" :srcObject="recorderRefSrcObject" muted hidden></audio>

    <div class='parent grid-parent'>

        <div class="record_btn" @click="!isRecording ? startRecording() : stopRecording(); $event.target.classList.toggle('recording')"/>

        <audio id="player" v-bind:src="playerSrc" controls controlsList="nodownload" class='child'></audio>

    </div>
    
    


</div>


  
</template>

<script>

export default {
    name: 'Recorder',

    data () {
    return {
      error: false,
      isRecording: false,
      chunks: [],
      stream: null,
      mediaRecorder: null,
      playerSrc: '',
      recorderRefSrcObject: null,
      promisePlay: null,
      constraints: {
            audio: true,
            video: false
        }
        
    }
    },
    mounted () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.error = "getUserMedia is not supported on your browser!"
        }
    },
    methods: {
        startRecording() {
            if (this.isRecording) return
            this.isRecording = true
            this.playerSrc = ''
            navigator.mediaDevices
                .getUserMedia(this.constraints)
                .then(stream => {
                    this.handleSuccess(stream)
                })
                .catch(error => {
                    this.handleError(error)
                })
        },

        handleSuccess(stream) {
            this.stream = stream
            
            this.stream.oninactive = () => {
                console.log("Stream ended!")
            };

            this.recorderRefSrcObject = this.stream
            this.mediaRecorder = new MediaRecorder(this.stream)

            this.mediaRecorder.addEventListener('dataavailable', this.onMediaRecorderDataAvailable);

            this.mediaRecorder.addEventListener('stop', this.onMediaRecorderStop);

            this.promisePlay = this.$refs.recorderaudio.play()

            this.mediaRecorder.start()
        },
        handleError(error) {
            console.log("navigator.getUserMedia error: ", error)
        },
        onMediaRecorderDataAvailable(e) { 
            this.chunks.push(e.data)
        },
        onMediaRecorderStop(e) { 
                const blob = new Blob(this.chunks, { 'type': 'audio/mpeg; codecs=opus' })
                const audioURL = window.URL.createObjectURL(blob)
                this.$emit('recordingstop', blob)
                this.playerSrc = audioURL
                this.chunks = []
                this.stream.getAudioTracks().forEach(track => track.stop())
                this.stream = null
                
        },
        stopRecording() {
            if (!this.isRecording) return
            
            this.isRecording = false
            this.mediaRecorder.stop()

            if (this.promisePlay !== undefined) {
                this.promisePlay.then(_ => {
                    this.$refs.recorderaudio.pause()
                })
            }
            this.promisePlay = null

        }

    }

}

</script>

<style>

@import 'https://fonts.googleapis.com/icon?family=Material+Icons|Roboto';

.record_btn {
    width: 45px;
    height: 45px;
    font-family: 'Material Icons';
    font-size: 35px;
    color: #e74c3c;
    background: none;
    border: 2px solid #e74c3c;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.15s linear;
    padding-left: 10px;
    padding-top: 7px;
    margin-right: 20px;
}

.record_btn:hover {
    transition: 0.15s linear;
    transform: scale( 1.05 );
}

.record_btn:active {
    background: #f5f5f5;
}

.record_btn:after {
    content: '\E029';
}

.record_btn[disabled] {
    border: 2px solid #ccc;
}

.record_btn[disabled]:after {
    content: '\E02B';
    color: #ccc;
}

.record_btn[disabled]:hover {
    transition: 0.15s linear;
    transform: none;
}

.record_btn[disabled]:active {
    background: none;
}


.recording {
    animation: recording 2s infinite ease-in-out;
    position: relative;
}

.recording:before {
    content: '';
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0px;
    height: 0px;
    margin: 0px;
    border-radius: 50%;
    background: rgba( 0, 0, 0, 0.05 );
    animation: recording_before 2s infinite ease-in-out;
}

@keyframes recording {
    from {
        transform: scale( 1.1 );
    }

    50% {
        transform: none;
    }

    to {
        transform: scale( 1.1 );
    }
}

@keyframes recording_before {
    80% {
        width: 200px;
        height: 200px;
        margin: -100px;
        opacity: 0;
    }

    to {
        opacity: 0;
    }
}

.container {
	
    display: flex;
	flex-direction: column;
	
}

button {
	max-width: 300px;
}

#player{
    width: 100%;
}

.grid-parent {
  display: grid;
  grid-template-columns: 0fr 1fr
}

</style>