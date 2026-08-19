const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
})
.then(stream => {
    video.srcObject = stream;
})
.catch(error => {
    console.error('Camera error:', error);
});
const containerData = {
    recordId: 'TEST001',
    containerName: 'Container Test',
    containerId: 'CONTEST',
    wasteType: 'Plastic Waste'
};

localStorage.setItem('offlineContainer', JSON.stringify(containerData));

const savedData = JSON.parse(localStorage.getItem('offlineContainer'));

const resultDiv = document.getElementById('result');

resultDiv.innerHTML = `
    <h3>Container Details</h3>
    <p><b>Container Name:</b> ${savedData.containerName}</p>
    <p><b>Container Id:</b> ${savedData.containerId}</p>
    <p><b>Waste Type:</b> ${savedData.wasteType}</p>
`;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => {
            console.log('Service Worker registered');
        })
        .catch(error => {
            console.error('Service Worker error:', error);
        });
}