const video = document.getElementById('video');
const scanResult = document.getElementById('scanResult');
const resultDiv = document.getElementById('result');

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
})
.then(stream => {
    video.srcObject = stream;
    video.setAttribute('playsinline', true);
    video.play();

    requestAnimationFrame(scanQRCode);
})
.catch(error => {
    console.error('Camera Error:', error);
    scanResult.innerText = 'Unable to access camera';
});

function scanQRCode() {

    if (video.readyState === video.HAVE_ENOUGH_DATA) {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );

        if (code) {

            console.log('QR Found:', code.data);

            scanResult.innerText =
                'Scanned QR: ' + code.data;

            return;
        }
    }

    requestAnimationFrame(scanQRCode);
}