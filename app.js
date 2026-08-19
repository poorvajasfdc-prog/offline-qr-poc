

const SALESFORCE_API =
    'https://playful-unicorn-9booaz-dev-ed.trailblaze.my.site.com/services/apexrest/offline-containers/';



const video = document.getElementById('video');
const scanResult = document.getElementById('scanResult');
const resultDiv = document.getElementById('result');
const syncButton = document.getElementById('syncButton');
const syncStatus = document.getElementById('syncStatus');

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

let scanStopped = false;


// SYNC BUTTON

if (syncButton) {
    syncButton.addEventListener('click', syncContainers);
}



// SYNC SALESFORCE DATA

async function syncContainers() {

    if (!navigator.onLine) {
        syncStatus.innerText =
            'Internet connection is required for sync.';
        return;
    }

    syncStatus.innerText = 'Syncing Container data...';

    try {

        const response = await fetch(SALESFORCE_API);

        if (!response.ok) {
            throw new Error(
                'HTTP Error: ' + response.status
            );
        }

        const records = await response.json();

        const containers = {};

        records.forEach(record => {

            containers[record.recordId] = {
                recordId: record.recordId,
                containerName: record.containerName,
                containerId: record.containerId,
                wasteType: record.wasteType
            };

        });

        // Save all Container records in phone browser
        localStorage.setItem(
            'offlineContainers',
            JSON.stringify(containers)
        );

        localStorage.setItem(
            'lastContainerSync',
            new Date().toISOString()
        );

        syncStatus.innerText =
            records.length +
            ' Container records synced successfully';

        console.log(
            'Synced Containers:',
            containers
        );

    } catch (error) {

        console.error(
            'Sync Error:',
            error
        );

        syncStatus.innerText =
            'Container sync failed';
    }
}




function getOfflineContainers() {

    const savedData =
        localStorage.getItem('offlineContainers');

    if (!savedData) {
        return {};
    }

    try {

        return JSON.parse(savedData);

    } catch (error) {

        console.error(
            'Local Storage Error:',
            error
        );

        return {};
    }
}




navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment'
    }
})
.then(stream => {

    video.srcObject = stream;

    video.setAttribute(
        'playsinline',
        true
    );

    video.play();

    requestAnimationFrame(
        scanQRCode
    );

})
.catch(error => {

    console.error(
        'Camera Error:',
        error
    );

    scanResult.innerText =
        'Camera Error: ' +
        error.name +
        ' - ' +
        error.message;
});




function scanQRCode() {

    if (scanStopped) {
        return;
    }

    if (
        video.readyState ===
        video.HAVE_ENOUGH_DATA
    ) {

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imageData =
            context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

        if (
            typeof jsQR !==
            'undefined'
        ) {

            const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

            if (code) {

                handleQRCode(
                    code.data
                );

                return;
            }
        }
    }

    requestAnimationFrame(
        scanQRCode
    );
}




function handleQRCode(scannedValue) {

    scannedValue =
        scannedValue.trim();

    console.log(
        'Scanned QR:',
        scannedValue
    );

    // Get record Id from QR URL
    const match =
        scannedValue.match(
            /c__recordId=([a-zA-Z0-9]+)/
        );

    if (!match || !match[1]) {

        scanResult.innerText =
            'Invalid Container QR';

        requestAnimationFrame(
            scanQRCode
        );

        return;
    }

    const recordId =
        match[1];

    console.log(
        'Scanned Record Id:',
        recordId
    );


    // Read saved Salesforce data
    const containers =
        getOfflineContainers();

    const container =
        containers[recordId];




    if (container) {

        scanStopped = true;

        if (navigator.onLine) {

            scanResult.innerText =
                'QR Scanned Successfully';

        } else {

            scanResult.innerText =
                'QR Scanned Successfully - Offline';
        }

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

    }

 

    else {

        scanStopped = true;

        scanResult.innerText =
            'QR Scanned Successfully';

        resultDiv.innerHTML = `
            <p>
                Container data is not available offline.
            </p>

            <p>
                <b>Record Id:</b>
                ${recordId}
            </p>

            <p>
                Please connect to the internet
                and click Sync Container Data first.
            </p>
        `;
    }
}




if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register('./sw.js')
        .then(() => {

            console.log(
                'Service Worker Registered'
            );

        })
        .catch(error => {

            console.error(
                'Service Worker Error:',
                error
            );

        });
}