import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';

export const DataFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isExecuting = data?.isExecuting;

  return (
    <>
      {/* Background Glow when executing */}
      {isExecuting && (
        <path
          d={edgePath}
          fill="none"
          stroke="#a855f7"
          strokeWidth={8}
          strokeOpacity={0.25}
          className="filter blur-[3px]"
        />
      )}

      {/* Main Connection Curve */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isExecuting ? 3 : 2,
          stroke: isExecuting ? '#a855f7' : '#334155',
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />

      {/* Animated Traveling Data Packet (Pulse Circle) */}
      {isExecuting && (
        <circle r="4.5" fill="#06b6d4" className="filter drop-shadow-[0_0_8px_#06b6d4]">
          <animateMotion
            dur="1.2s"
            repeatCount="indefinite"
            path={edgePath}
            keyPoints="0;1"
            keyTimes="0;1"
          />
        </circle>
      )}
    </>
  );
};
