const video = document.getElementById('video');


startVideo = () => {
    // navigator.getUserMedia(
    //     {
    //         video: {}
    //     },
    //     stream => video.srcObject = stream,
    //     err => console.error(err)
    // )

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then(
            (cameraStream) => {
                video.srcObject = cameraStream;
            }
        )

}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models'),
    faceapi.nets.ageGenderNet.loadFromUri('models')
]).then(startVideo)


video.addEventListener('play', () => {
    //create the canvas from video element as we have created above
    const canvas = faceapi.createCanvasFromMedia(video);
    //append canvas to body or the dom element where you want to append it
    document.body.append(canvas)
    // displaySize will help us to match the dimension with video screen and accordingly it will draw our detections
    // on the streaming video screen
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
            drawBox.draw(canvas)
        })
    }, 100)
})