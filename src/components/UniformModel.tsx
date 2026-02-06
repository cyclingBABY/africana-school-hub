import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import { Suspense } from "react";

interface UniformModelProps {
  type: "boys" | "girls";
}

const BoysUniform = () => {
  return (
    <group>
      {/* Shirt Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1.4, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 1.25, 0.1]}>
        <boxGeometry args={[0.5, 0.15, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Left Sleeve */}
      <mesh position={[-0.85, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.6, 0.4, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Right Sleeve */}
      <mesh position={[0.85, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.6, 0.4, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Tie */}
      <mesh position={[0, 0.7, 0.26]}>
        <boxGeometry args={[0.15, 0.8, 0.05]} />
        <meshStandardMaterial color="#166534" roughness={0.4} />
      </mesh>
      
      {/* Tie Knot */}
      <mesh position={[0, 1.05, 0.28]}>
        <boxGeometry args={[0.2, 0.15, 0.08]} />
        <meshStandardMaterial color="#166534" roughness={0.4} />
      </mesh>
      
      {/* Trousers */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[1.1, 1.2, 0.4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      
      {/* Left Leg */}
      <mesh position={[-0.3, -1.8, 0]}>
        <boxGeometry args={[0.45, 1.0, 0.35]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[0.3, -1.8, 0]}>
        <boxGeometry args={[0.45, 1.0, 0.35]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
    </group>
  );
};

const GirlsUniform = () => {
  return (
    <group>
      {/* Blouse Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.1, 1.3, 0.45]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 1.2, 0.1]}>
        <boxGeometry args={[0.6, 0.12, 0.25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Left Sleeve */}
      <mesh position={[-0.8, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.55, 0.35, 0.32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Right Sleeve */}
      <mesh position={[0.8, 0.55, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.55, 0.35, 0.32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      
      {/* Veil/Hijab */}
      <mesh position={[0, 1.6, -0.1]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      
      {/* Veil drape left */}
      <mesh position={[-0.4, 0.9, 0.15]}>
        <boxGeometry args={[0.3, 1.0, 0.1]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      
      {/* Veil drape right */}
      <mesh position={[0.4, 0.9, 0.15]}>
        <boxGeometry args={[0.3, 1.0, 0.1]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      
      {/* Skirt - main body */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 1.4, 16]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      
      {/* Skirt - lower section */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.6, 16]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
    </group>
  );
};

const UniformModel = ({ type }: UniformModelProps) => {
  return (
    <div className="h-72 w-full rounded-lg overflow-hidden bg-gradient-to-b from-muted to-secondary/50">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-3, 3, 2]} intensity={0.5} />
          
          <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            {type === "boys" ? <BoysUniform /> : <GirlsUniform />}
          </Float>
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default UniformModel;
