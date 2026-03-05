// Scanner module for barcode scanning functionality

const Scanner = {
    html5QrCode: null,
    isScanning: false,

    init() {
        this.html5QrCode = new Html5Qrcode("reader");
    },

    async start(onSuccess, onError) {
        if (this.isScanning) return;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0
        };

        try {
            await this.html5QrCode.start(
                { facingMode: "environment" }, // Use back camera
                config,
                (decodedText) => {
                    this.stop();
                    onSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scanning errors (they happen frequently during scanning)
                }
            );
            this.isScanning = true;
        } catch (err) {
            console.error('Scanner Error:', err);
            onError('Unable to access camera. Please ensure camera permissions are granted.');
        }
    },

    async stop() {
        if (this.isScanning && this.html5QrCode) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    }
};