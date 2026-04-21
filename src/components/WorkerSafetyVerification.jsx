import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle, ShieldCheck, HardHat, UserCircle2 } from 'lucide-react';

export function WorkerSafetyVerification() {
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
            console.log("Demande d'accès à la caméra...");
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            });
            
            console.log("Stream obtenu:", stream);
            streamRef.current = stream;
            setIsCameraOn(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                // Attendre que la vidéo soit prête avant d'activer
                videoRef.current.onloadedmetadata = () => {
                    console.log("Métadonnées vidéo chargées");
                    setIsVideoReady(true);
                };
                
                videoRef.current.oncanplay = () => {
                    console.log("Vidéo peut être lue");
                    videoRef.current.play().then(() => {
                        console.log("Vidéo en lecture");
                        
                        // Démarrer la détection automatique toutes les 2 secondes
                        setTimeout(() => {
                            intervalRef.current = setInterval(() => {
                                captureAndAnalyze();
                            }, 2000);
                        }, 1000);
                    }).catch(err => {
                        console.error("Erreur lors de la lecture:", err);
                        setCameraError("Erreur de lecture vidéo");
                    });
                };
            }
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            setCameraError(err.message);
            setIsCameraOn(false);
            alert(`Impossible d'accéder à la caméra: ${err.message}\n\nVérifiez les permissions du navigateur.`);
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

    // Capturer une image et l'envoyer au backend
    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
        
        // Vérifier que la vidéo est bien en lecture
        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            console.log("Vidéo pas encore prête");
            return;
        }

        setIsAnalyzing(true);
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width === 0 || canvas.height === 0) {
            console.log("Dimensions vidéo invalides");
            setIsAnalyzing(false);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convertir en blob
        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('image', blob, 'capture.jpg');
                
                const response = await fetch('http://localhost:8000/api/safety/detect', {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setDetectionResult(result);
                } else {
                    console.error('Erreur lors de la détection');
                }
            } catch (err) {
                console.error('Erreur réseau:', err);
            } finally {
                setIsAnalyzing(false);
            }
        }, 'image/jpeg', 0.8);
    };

    // Nettoyer lors du démontage du composant
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
            return { status: 'safe', message: 'Complete Safety Equipment', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' };
        } else if (!hasHelmet && !hasVest) {
            return { status: 'danger', message: 'DANGER: No Equipment Detected', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' };
        } else {
            return { status: 'warning', message: 'WARNING: Incomplete Equipment', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' };
        }
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="text-neon-500" size={36} />
                    Worker Safety Verification
                </h1>
                <p className="text-slate-400 mt-2">
                    Automatic verification of Personal Protective Equipment (PPE)
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section Caméra */}
                <div className="bg-industrial-800 border border-industrial-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Camera size={20} className="text-neon-500" />
                            Camera Feed
                        </h2>
                        <button
                            onClick={isCameraOn ? stopCamera : startCamera}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                isCameraOn 
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                                    : 'bg-neon-500/20 text-neon-500 hover:bg-neon-500/30 border border-neon-500/30'
                            }`}
                        >
                            {isCameraOn ? (
                                <>
                                    <CameraOff size={18} />
                                    Stop
                                </>
                            ) : (
                                <>
                                    <Camera size={18} />
                                    Start
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative bg-industrial-900 rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                        />
                        
                        {!isCameraOn && !cameraError && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                <CameraOff size={48} className="mb-3" />
                                <p className="text-sm">Camera Disabled</p>
                                <p className="text-xs mt-1">Click "Start" to activate</p>
                            </div>
                        )}
                        
                        {isCameraOn && !isVideoReady && !cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-industrial-900 text-slate-400">
                                <div className="w-12 h-12 border-4 border-neon-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-sm">Loading camera...</p>
                            </div>
                        )}
                        
                        {cameraError && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-red-400">
                                <AlertTriangle size={48} className="mb-3" />
                                <p className="text-sm">Camera Error</p>
                                <p className="text-xs mt-1">{cameraError}</p>
                            </div>
                        )}
                        
                        {isCameraOn && isVideoReady && isAnalyzing && (
                            <div className="absolute top-4 right-4 bg-neon-500/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Analyzing...
                            </div>
                        )}
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Section Résultats */}
                <div className="bg-industrial-800 border border-industrial-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-neon-500" />
                        Detection Results
                    </h2>

                    {!detectionResult ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <UserCircle2 size={64} className="mb-4" />
                            <p className="text-center">Waiting for detection...</p>
                            <p className="text-xs mt-2 text-slate-600">Activate camera to start</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Statut Global */}
                            {overallStatus && (
                                <div className={`p-4 rounded-lg border ${overallStatus.bgColor} ${overallStatus.borderColor}`}>
                                    <div className="flex items-center gap-3">
                                        {overallStatus.status === 'safe' ? (
                                            <CheckCircle size={32} className={overallStatus.color} />
                                        ) : (
                                            <AlertTriangle size={32} className={overallStatus.color} />
                                        )}
                                        <div>
                                            <div className={`font-bold text-lg ${overallStatus.color}`}>
                                                {overallStatus.message}
                                            </div>
                                            <div className="text-sm text-slate-400 mt-1">
                                                Last update: {new Date().toLocaleTimeString('en-US')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Détails des équipements */}
                            <div className="space-y-3">
                                {/* Casque */}
                                <div className={`p-4 rounded-lg border transition-all ${
                                    detectionResult.helmet_detected 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <HardHat size={24} className={
                                                detectionResult.helmet_detected ? 'text-green-500' : 'text-red-500'
                                            } />
                                            <div>
                                                <div className="font-semibold text-white">Safety Helmet</div>
                                                <div className="text-sm text-slate-400">
                                                    Confidence: {(detectionResult.helmet_confidence * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        {detectionResult.helmet_detected ? (
                                            <CheckCircle size={24} className="text-green-500" />
                                        ) : (
                                            <AlertTriangle size={24} className="text-red-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Gilet */}
                                <div className={`p-4 rounded-lg border transition-all ${
                                    detectionResult.vest_detected 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={24} className={
                                                detectionResult.vest_detected ? 'text-green-500' : 'text-red-500'
                                            } />
                                            <div>
                                                <div className="font-semibold text-white">Safety Vest</div>
                                                <div className="text-sm text-slate-400">
                                                    Confidence: {(detectionResult.vest_confidence * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        {detectionResult.vest_detected ? (
                                            <CheckCircle size={24} className="text-green-500" />
                                        ) : (
                                            <AlertTriangle size={24} className="text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div className="bg-industrial-900 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-white mb-2">Information</h3>
                                <div className="space-y-1 text-sm text-slate-400">
                                    <div>Persons detected: {detectionResult.person_count || 0}</div>
                                    <div>Processing time: {detectionResult.processing_time?.toFixed(3)}s</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="bg-industrial-800 border border-industrial-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Safety Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Helmet must be worn at all times in the production area</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">High-visibility vest is mandatory</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Automatic verification every 2 seconds</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Real-time alerts in case of non-compliance</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
