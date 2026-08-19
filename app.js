const containers = {
    "a07NS00002SNOQMYA1": {
        containerName: "Container 002",
        containerId: "CON002",
        wasteType: "Non-Wet Waste"
    }
};

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

        if (typeof jsQR !== 'undefined') {

            const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

            if (code) {

                // QR value clean cheyyadam
                const scannedValue = code.data.trim();

                console.log('Scanned QR:', scannedValue);

                // URL nunchi c__recordId direct ga extract chestundi
                const match =
                    scannedValue.match(/c__recordId=([a-zA-Z0-9]+)/);

                if (match && match[1]) {

                    const recordId = match[1];

                    console.log('Record Id:', recordId);

                    const container = containers[recordId];

                    if (container) {

                        scanResult.innerText =
                            'QR Scanned Successfully';

                        resultDiv.innerHTML = `
                            <h2>Container Details</h2>
                            <p><b>Container Name:</b> ${container.containerName}</p>
                            <p><b>Container Id:</b> ${container.containerId}</p>
                            <p><b>Waste Type:</b> ${container.wasteType}</p>
                        `;

                    } else {

                        scanResult.innerText =
                            'QR Scanned Successfully';

                        resultDiv.innerHTML = `
                            <p>Container data not available offline.</p>
                            <p>Record Id: ${recordId}</p>
                        `;
                    }

                } else {

                    scanResult.innerText =
                        'Record Id not found in QR';

                    resultDiv.innerHTML =
                        `<p>${scannedValue}</p>`;
                }

                return;
            }
        }
    }

    requestAnimationFrame(scanQRCode);
}