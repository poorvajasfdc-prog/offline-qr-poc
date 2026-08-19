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
    scanResult.innerText =
        'Camera Error: ' + error.name + ' - ' + error.message;
});

function scanQRCode() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (typeof jsQR !== 'undefined') {
            const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                    inversionAttempts: 'dontInvert'
                }
            );

            if (code) {
                scanResult.innerText = 'Scanned QR: ' + code.data;

                console.log('QR Found:', code.data);

                return;
            }
        } else {
            scanResult.innerText = 'jsQR library not loaded';
        }
    }

    requestAnimationFrame(scanQRCode);
}