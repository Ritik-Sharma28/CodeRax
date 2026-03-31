import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 120, darkMode, mouse }) {
    const meshRef = useRef();
    const linesRef = useRef();

    const particleData = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

            velocities[i * 3] = (Math.random() - 0.5) * 0.003;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

            const palette = darkMode
                ? [
                      [0.39, 0.4, 0.95],
                      [0.09, 0.71, 0.83],
                      [0.66, 0.33, 0.97],
                  ]
                : [
                      [0.39, 0.4, 0.95],
                      [0.09, 0.55, 0.73],
                      [0.55, 0.25, 0.85],
                  ];
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }
        return { positions, velocities, colors };
    }, [count, darkMode]);

    const linePositions = useMemo(() => new Float32Array(count * count * 6), [count]);

    useFrame(() => {
        if (!meshRef.current) return;
        const pos = meshRef.current.geometry.attributes.position.array;
        const vel = particleData.velocities;

        for (let i = 0; i < count; i++) {
            pos[i * 3] += vel[i * 3];
            pos[i * 3 + 1] += vel[i * 3 + 1];
            pos[i * 3 + 2] += vel[i * 3 + 2];

            if (Math.abs(pos[i * 3]) > 5) vel[i * 3] *= -1;
            if (Math.abs(pos[i * 3 + 1]) > 3) vel[i * 3 + 1] *= -1;
            if (Math.abs(pos[i * 3 + 2]) > 2) vel[i * 3 + 2] *= -1;

            // Mouse influence
            if (mouse.current) {
                const dx = mouse.current.x * 4 - pos[i * 3];
                const dy = mouse.current.y * 2.5 - pos[i * 3 + 1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 2.5) {
                    pos[i * 3] += dx * 0.0008;
                    pos[i * 3 + 1] += dy * 0.0008;
                }
            }
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;

        // Draw lines between nearby particles
        if (linesRef.current) {
            let lineIdx = 0;
            const maxDist = 1.6;
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = pos[i * 3] - pos[j * 3];
                    const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                    const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                    const d = dx * dx + dy * dy + dz * dz;
                    if (d < maxDist * maxDist && lineIdx < linePositions.length / 3 - 2) {
                        linePositions[lineIdx * 3] = pos[i * 3];
                        linePositions[lineIdx * 3 + 1] = pos[i * 3 + 1];
                        linePositions[lineIdx * 3 + 2] = pos[i * 3 + 2];
                        lineIdx++;
                        linePositions[lineIdx * 3] = pos[j * 3];
                        linePositions[lineIdx * 3 + 1] = pos[j * 3 + 1];
                        linePositions[lineIdx * 3 + 2] = pos[j * 3 + 2];
                        lineIdx++;
                    }
                }
            }
            for (let k = lineIdx; k < lineIdx + 6; k++) {
                if (k * 3 < linePositions.length) {
                    linePositions[k * 3] = 0;
                    linePositions[k * 3 + 1] = 0;
                    linePositions[k * 3 + 2] = 0;
                }
            }
            linesRef.current.geometry.attributes.position.array = linePositions;
            linesRef.current.geometry.attributes.position.needsUpdate = true;
            linesRef.current.geometry.setDrawRange(0, lineIdx);
        }
    });

    return (
        <>
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={particleData.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={count}
                        array={particleData.colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.04}
                    vertexColors
                    transparent
                    opacity={darkMode ? 0.8 : 0.6}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={linePositions.length / 3}
                        array={linePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color={darkMode ? "#818cf8" : "#6366f1"}
                    transparent
                    opacity={darkMode ? 0.12 : 0.08}
                    depthWrite={false}
                />
            </lineSegments>
        </>
    );
}

function ParticleField({ darkMode, className = "" }) {
    const mouse = useRef({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handlePointerMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current = {
            x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
            y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
    };

    if (isMobile) return null;

    return (
        <div
            className={`absolute inset-0 ${className}`}
            onPointerMove={handlePointerMove}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 55 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true }}
                style={{ background: "transparent" }}
            >
                <Particles count={100} darkMode={darkMode} mouse={mouse} />
            </Canvas>
        </div>
    );
}

export default ParticleField;
