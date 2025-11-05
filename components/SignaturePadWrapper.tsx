
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    SignaturePad: any;
  }
}

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
  off: () => void;
  on: () => void;
}

const SignaturePadWrapper: React.ForwardRefRenderFunction<SignaturePadHandle> = (props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new window.SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
      });

      const resizeCanvas = () => {
        if (canvasRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
          canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
          canvasRef.current.getContext("2d")?.scale(ratio, ratio);
          signaturePadRef.current.clear(); 
        }
      };

      window.addEventListener("resize", resizeCanvas);
      // A small delay ensures the offsetWidth is correct on initial render.
      setTimeout(resizeCanvas, 0);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => signaturePadRef.current?.clear(),
    isEmpty: () => signaturePadRef.current?.isEmpty(),
    toDataURL: () => signaturePadRef.current?.toDataURL('image/png'),
    off: () => signaturePadRef.current?.off(),
    on: () => signaturePadRef.current?.on(),
  }));

  return (
    <canvas ref={canvasRef} className="signature-pad-canvas"></canvas>
  );
};

export default forwardRef(SignaturePadWrapper);
