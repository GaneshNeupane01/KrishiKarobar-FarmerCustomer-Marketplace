import React, { useEffect, useState } from 'react';
import { Leaf, Sprout, TreePine, Flower, Apple, Wheat } from 'lucide-react';

const FloatingLeavesBackground = ({ 
  leafCount = 20, 
  opacity = 0.15, 
  speed = 'normal', // 'slow', 'normal', 'fast'
  colors = ['emerald', 'teal', 'green', 'lime'] 
}) => {
  const [leaves, setLeaves] = useState([]);

  // Different leaf icons for variety
  const leafTypes = [Leaf, Sprout, TreePine, Flower, Apple, Wheat];
  
  // Color variations based on the colors prop
  const colorClasses = {
    emerald: ['text-emerald-200', 'text-emerald-300', 'text-emerald-400'],
    teal: ['text-teal-200', 'text-teal-300', 'text-teal-400'],
    green: ['text-green-200', 'text-green-300', 'text-green-400'],
    lime: ['text-lime-200', 'text-lime-300', 'text-lime-400'],
    cyan: ['text-cyan-200', 'text-cyan-300', 'text-cyan-400'],
    sky: ['text-sky-200', 'text-sky-300', 'text-sky-400'],
    blue: ['text-blue-200', 'text-blue-300', 'text-blue-400'],
    indigo: ['text-indigo-200', 'text-indigo-300', 'text-indigo-400'],
  };

  // Speed configurations
  const speedConfig = {
    slow: { duration: '25s', delay: '8s' },
    normal: { duration: '20s', delay: '6s' },
    fast: { duration: '15s', delay: '4s' }
  };

  useEffect(() => {
    const generateLeaves = () => {
      const newLeaves = [];
      for (let i = 0; i < leafCount; i++) {
        const LeafIcon = leafTypes[Math.floor(Math.random() * leafTypes.length)];
        const colorPalette = colors[Math.floor(Math.random() * colors.length)];
        const colorVariations = colorClasses[colorPalette];
        const color = colorVariations[Math.floor(Math.random() * colorVariations.length)];
        
        newLeaves.push({
          id: i,
          Icon: LeafIcon,
          x: Math.random() * 100, // Random horizontal position (%)
          y: Math.random() * 100, // Random vertical starting position (%)
          size: Math.random() * 20 + 15, // Size between 15-35px
          color: color,
          animationDelay: Math.random() * 20, // Random delay up to 20s
          rotationSpeed: Math.random() * 10 + 5, // Rotation speed
          horizontalDrift: Math.random() * 30 - 15, // Horizontal drift (-15 to +15)
          opacity: Math.random() * 0.4 + 0.1, // Individual opacity variation
        });
      }
      setLeaves(newLeaves);
    };

    generateLeaves();
  }, []); // Empty dependency array means this only runs once on mount

  const currentSpeed = speedConfig[speed];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => {
        const LeafIcon = leaf.Icon;
        return (
          <div
            key={leaf.id}
            className="absolute animate-float-leaf"
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              animationDelay: `${leaf.animationDelay}s`,
              animationDuration: currentSpeed.duration,
              opacity: opacity * leaf.opacity,
              '--horizontal-drift': `${leaf.horizontalDrift}px`,
              '--rotation-speed': `${leaf.rotationSpeed}s`,
            }}
          >
            <LeafIcon
              size={leaf.size}
              className={`${leaf.color} animate-leaf-rotate`}
              style={{
                animationDuration: `${leaf.rotationSpeed}s`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          </div>
        );
      })}
      
      <style >{`
        @keyframes float-leaf {
          0% {
            transform: translateY(-100vh) translateX(0px) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translateY(-90vh) translateX(5px) scale(1);
          }
          50% {
            transform: translateY(-50vh) translateX(var(--horizontal-drift)) scale(1.1);
          }
          95% {
            opacity: 1;
            transform: translateY(10vh) translateX(calc(var(--horizontal-drift) * 1.5)) scale(0.9);
          }
          100% {
            transform: translateY(20vh) translateX(calc(var(--horizontal-drift) * 2)) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes leaf-rotate {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(90deg);
          }
          50% {
            transform: rotate(180deg);
          }
          75% {
            transform: rotate(270deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .animate-float-leaf {
          animation: float-leaf linear infinite;
        }
        
        .animate-leaf-rotate {
          animation: leaf-rotate linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingLeavesBackground;