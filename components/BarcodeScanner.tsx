import React, { useEffect, useRef } from 'react';

// Make sure to declare the global Html5QrcodeScanner if you don't have typings for it
declare const Html5Qrcode: any;

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanError: (errorMessage: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError }) => {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);

    useEffect(() => {
        if (scannerRef.current) {
            const html5QrCode = new Html5Qrcode(scannerRef.current.id);
            html5QrCodeRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            const startScanner = async () => {
                try {
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        config,
                        onScanSuccess,
                        onScanError
                    );
                } catch (err) {
                    console.error("Failed to start scanner", err);
                     // Fallback for devices without a back camera
                    try {
                        await html5QrCode.start(
                            { }, // Let the library decide the camera
                            config,
                            onScanSuccess,
                            onScanError
                        );
                    } catch (fallbackErr) {
                         console.error("Fallback scanner start failed", fallbackErr);
                         alert("Could not start camera. Please ensure you have given camera permissions.");
                    }
                }
            };

            startScanner();
        }

        // Cleanup function to stop the scanner
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch((err: any) => {
                    console.error("Failed to stop scanner", err);
                });
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    return <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>;
};

export default BarcodeScanner;