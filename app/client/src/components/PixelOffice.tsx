import React, { useEffect, useRef } from "react";
import { cerebroColors as C } from "@/lib/keepConfig";
import { PixelEngine, AgentState } from "@/lib/pixelEngine";

interface PixelOfficeProps {
  agents: AgentState[];
  onAgentClick?: (agentId: string) => void;
  showGrid?: boolean;
  width?: number;
  height?: number;
}

export const PixelOffice: React.FC<PixelOfficeProps> = ({
  agents,
  onAgentClick,
  showGrid = true,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PixelEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize pixel engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new PixelEngine(canvasRef.current, {
      width,
      height,
      backgroundColor: C.background,
      gridColor: C.borderSoft,
      showGrid,
    });

    engineRef.current = engine;

    return () => {
      engine.dispose();
    };
  }, [width, height, showGrid]);

  // Update agents
  useEffect(() => {
    if (!engineRef.current) return;

    // Clear existing agents
    engineRef.current.getAgents().forEach((agent) => {
      engineRef.current?.removeAgent(agent.id);
    });

    // Add new agents
    agents.forEach((agent) => {
      engineRef.current?.addAgent(agent);
    });
  }, [agents]);

  // Animation loop
  useEffect(() => {
    if (!engineRef.current || !canvasRef.current) return;

    const animate = () => {
      engineRef.current?.render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixelSize = 16;

    // Find clicked agent
    engineRef.current.getAgents().forEach((agent) => {
      const agentScreenX = agent.position.x * pixelSize;
      const agentScreenY = agent.position.y * pixelSize;

      if (
        x >= agentScreenX &&
        x <= agentScreenX + pixelSize &&
        y >= agentScreenY &&
        y <= agentScreenY + pixelSize
      ) {
        onAgentClick?.(agent.id);
      }
    });
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ background: C.background }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="cursor-pointer rounded-md transition-shadow"
        style={{
          background: C.surface,
          border: `1px solid ${C.borderSoft}`,
          imageRendering: "crisp-edges",
        } as React.CSSProperties}
      />
    </div>
  );
};

export default PixelOffice;
