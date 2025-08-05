import React from "react";
import { Pinwheel } from "ldrs/react";
import "ldrs/react/Pinwheel.css";

type LoadingProps = {
  size?: number;
};

function Loading({ size = 35 }: LoadingProps) {
  return (
    <div className="flex items-center justify-center">
      <Pinwheel size={size} stroke="3.5" speed="0.9" color="primary" />
    </div>
  );
}

export default Loading;
