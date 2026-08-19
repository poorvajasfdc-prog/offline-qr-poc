// Offline Container Data - POC
const containers = {
    "a07NS00002SN0QMYA1": {
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
    video: {
        facingMode: 'environment'
    }
})
.then(stream => {

    video.srcObject = stream;
    video.setAttribute('playsinline', true);
    video.play();

    requestAnimationFrame(scanQRCode);

})
.catch(error => {

    console.error('Camera Error:', error);

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
                imageData.height,
                {
                    inversionAttempts: 'dontInvert'
                }
            );

            if (code) {

                console.log('QR Found:', code.data);

                const scannedUrl = code.data;

                try {

                    // Read scanned QR URL
                    const url = new URL(scannedUrl);

                    // Get Salesforce Record Id from URL
                    const recordId =
                        url.searchParams.get('c__recordId');

                    console.log('Record Id:', recordId);

                    if (recordId) {

                        // Search local/offline data
                        const container = containers[recordId];

                        if (container) {

                            scanResult.innerText =
                                'QR Scanned Successfully';

                            resultDiv.innerHTML = `
                                <h2>Container Details</h2>

                                <p>
                                    <b>Container Name:</b>
                                    ${container.containerName}
                                </p>

                                <p>
                                    <b>Container Id:</b>
                                    ${container.containerId}
                                </p>

                                <p>
                                    <b>Waste Type:</b>
                                    ${container.wasteType}
                                </p>
                            `;

                        } else {

                            scanResult.innerText =
                                'QR Scanned Successfully';

                            resultDiv.innerHTML = `
                                <p>
                                    Container data not available offline.
                                </p>
                            `;
                        }

                    } else {

                        scanResult.innerText =
                            'Record Id not found in QR';
                    }

                } catch (error) {

                    console.error('Invalid QR URL:', error);

                    scanResult.innerText =
                        'Invalid QR URL';
                }

                // Stop after successful QR detection
                return;
            }

        } else {

            scanResult.innerText =
                'jsQR library not loaded';
        }
    }

    requestAnimationFrame(scanQRCode);
}