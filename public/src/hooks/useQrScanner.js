import { useEffect, useRef, useState } from "../lib.js";
import { getPermitCodeFromText } from "../utils/format.js";

export const useQrScanner = ({ enabled, onDetected }) => {
  const [status, setStatus] = useState("Camera scanner is ready.");
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const frameRef = useRef(0);
  const lastScannedValueRef = useRef("");
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    streamRef.current = null;
    frameRef.current = 0;
    detectorRef.current = null;
    lastScannedValueRef.current = "";
    setActive(false);
    setMode("");
    setStatus("Camera scanner stopped.");
  };

  useEffect(() => stopScanner, []);

  useEffect(() => {
    if (!enabled && active) {
      stopScanner();
    }
  }, [enabled, active]);

  const scanFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !streamRef.current) {
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      frameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      let detectedValue = "";

      if (window.BarcodeDetector) {
        const detector =
          detectorRef.current || new window.BarcodeDetector({ formats: ["qr_code"] });
        detectorRef.current = detector;
        const barcodes = await detector.detect(canvas);
        detectedValue = barcodes[0]?.rawValue || "";
      } else if (window.jsQR) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        detectedValue = result?.data || "";
      } else {
        setStatus("No QR scanning engine is available in this browser.");
        setActive(false);
        return;
      }

      const permitCode = getPermitCodeFromText(detectedValue);
      if (permitCode && permitCode !== lastScannedValueRef.current) {
        lastScannedValueRef.current = permitCode;
        setStatus("QR detected. Verifying permit...");

        try {
          const result = await onDetectedRef.current(permitCode);
          setStatus(
            result.valid
              ? "Valid permit verified from camera scan."
              : "Scanned permit is expired or invalid."
          );
        } catch (error) {
          setStatus(error.message);
        }

        window.setTimeout(() => {
          lastScannedValueRef.current = "";
        }, 2500);
      }
    } catch (error) {
      setStatus("Camera is active, but QR scanning failed on this frame.");
    }

    if (streamRef.current) {
      frameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const startScanner = async () => {
    if (active) {
      setStatus("Camera scanner is already running.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Browser camera access is not available on this device.");
    }

    if (!window.BarcodeDetector && !window.jsQR) {
      throw new Error("No QR scanning engine is available in this browser right now.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });

    streamRef.current = stream;
    setActive(true);
    setMode(window.BarcodeDetector ? "native" : "jsqr");

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    setStatus(
      window.BarcodeDetector
        ? "Camera started with native QR scanning. Hold the permit inside the guide box."
        : "Camera started with fallback QR scanning. Hold the permit inside the guide box."
    );
    frameRef.current = requestAnimationFrame(scanFrame);
  };

  return {
    active,
    mode,
    status,
    videoRef,
    canvasRef,
    startScanner,
    stopScanner,
  };
};
