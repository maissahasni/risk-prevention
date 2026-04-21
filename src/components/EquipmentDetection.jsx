import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle, ShieldCheck, HardHat, UserCircle2, Scan } from 'lucide-react';

export function EquipmentDetection() {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [detectionResult, setDetectionResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    // Démarrer la caméra
    const startCamera = async () => {
        try {
            setCameraError(null);
            console.log("Requesting camera access...");
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            });
            
            console.log("Stream obtained:", stream);
            streamRef.current = stream;
            setIsCameraOn(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                videoRef.current.onloadedmetadata = () => {
                    console.log("Video metadata loaded");
                    setIsVideoReady(true);
                };
                
                videoRef.current.oncanplay = () => {
                    console.log("Video can play");
                    videoRef.current.play().then(() => {
                        console.log("Video playing");
                        
                        // Start automatic detection every 2 seconds
                        setTimeout(() => {
                            intervalRef.current = setInterval(() => {
                                captureAndAnalyze();
                            }, 2000);
                        }, 1000);
                    }).catch(err => {
                        console.error("Error playing video:", err);
                        setCameraError("Video playback error");
                    });
                };
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraError(err.message);
            setIsCameraOn(false);
            alert(`Unable to access camera: ${err.message}\n\nPlease check browser permissions.`);
        }
    };

    // Arrêter la caméra
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.onloadedmetadata = null;
            videoRef.current.oncanplay = null;
        }
        setIsCameraOn(false);
        setIsVideoReady(false);
        setDetectionResult(null);
        setCameraError(null);
    };

    // Capturer une image et l'envoyer au backend avec YOLO
    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
        
        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            console.log("Video not ready yet");
            return;
        }

        setIsAnalyzing(true);
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width === 0 || canvas.height === 0) {
            console.log("Invalid video dimensions");
            setIsAnalyzing(false);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('image', blob, 'capture.jpg');
                
                const response = await fetch('http://localhost:8000/api/equipment/detect-yolo', {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setDetectionResult(result);
                } else {
                    console.error('Detection error');
                }
            } catch (err) {
                console.error('Network error:', err);
            } finally {
                setIsAnalyzing(false);
            }
        }, 'image/jpeg', 0.8);
    };

    // Nettoyer lors du démontage
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Déterminer le statut global
    const getOverallStatus = () => {
        if (!detectionResult) return null;
        
        const hasHelmet = detectionResult.helmet_detected;
        const hasVest = detectionResult.vest_detected;
        
        if (hasHelmet && hasVest) {
            return { 
                status: 'safe', 
                message: 'Complete Safety Equipment Detected', 
                color: 'text-green-500', 
                bgColor: 'bg-green-500/10', 
                borderColor: 'border-green-500/20' 
            };
        } else if (!hasHelmet && !hasVest) {
            return { 
                status: 'danger', 
                message: 'DANGER: No Equipment Detected', 
                color: 'text-red-500', 
                bgColor: 'bg-red-500/10', 
                borderColor: 'border-red-500/20' 
            };
        } else {
            return { 
                status: 'warning', 
                message: 'WARNING: Incomplete Equipment', 
                color: 'text-yellow-500', 
                bgColor: 'bg-yellow-500/10', 
                borderColor: 'border-yellow-500/20' 
            };
        }
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Scan className="text-neon-500" size={36} />
                    Equipment Detection
                </h1>
                <p className="text-slate-400 mt-2">
                    AI-powered safety equipment detection
                </p>
            </div>

            {/* Camera View */}
            <div className="bg-industrial-800 border border-industrial-700 rounded-lg p-6">
                <div className="relative w-full aspect-video bg-industrial-900 rounded-lg overflow-hidden shadow-lg">
                    {/* Video Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-contain ${(!isCameraOn || (detectionResult && detectionResult.annotated_image)) ? 'hidden' : ''}`}
                    />
                    
                    {/* Annotated Detection Image */}
                    {detectionResult && detectionResult.annotated_image && isCameraOn && (
                        <img 
                            src={detectionResult.annotated_image}
                            alt="Detection results"
                            className="w-full h-full object-contain"
                        />
                    )}
                
                    {/* Camera Off State */}
                    {!isCameraOn && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-industrial-900">
                            <CameraOff size={64} className="text-slate-500 mb-4" />
                            <p className="text-slate-400 text-lg mb-6">Camera Disabled</p>
                            <button
                                onClick={startCamera}
                                className="px-6 py-3 bg-neon-500 hover:bg-neon-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <Camera size={20} />
                                Start Camera
                            </button>
                        </div>
                    )}
                    
                    {/* Loading State */}
                    {isCameraOn && !isVideoReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-industrial-900">
                            <div className="w-16 h-16 border-4 border-neon-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400">Loading camera...</p>
                        </div>
                    )}
                    
                    {/* Error State */}
                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-industrial-900">
                            <AlertTriangle size={64} className="text-red-500 mb-4" />
                            <p className="text-red-400 text-lg">Camera Error</p>
                            <p className="text-slate-400 text-sm mt-2">{cameraError}</p>
                        </div>
                    )}
                    
                    {/* Floating Controls - Top Right */}
                    {isCameraOn && (
                        <button
                            onClick={stopCamera}
                            className="absolute top-4 right-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-colors z-10"
                        >
                            <CameraOff size={20} />
                            Stop
                        </button>
                    )}
                    
                    {/* AI Analyzing Indicator */}
                    {isCameraOn && isVideoReady && isAnalyzing && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-neon-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg z-10">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            AI Analyzing...
                        </div>
                    )}
                    
                    {/* Processing Time - Bottom Center */}
                    {isCameraOn && detectionResult && detectionResult.processing_time && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-industrial-800/90 text-slate-300 px-4 py-2 rounded-lg text-sm backdrop-blur-sm shadow-lg z-10 border border-industrial-700">
                            Processing: {detectionResult.processing_time.toFixed(3)}s
                        </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    );
}
