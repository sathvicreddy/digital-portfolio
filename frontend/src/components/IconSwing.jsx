import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './IconSwing.css';

// Example a diverse set of icons
import { FaPython, FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaDocker, FaAws, FaGithub, FaFigma, FaAndroid } from 'react-icons/fa';
import { SiCplusplus, SiMongodb, SiTailwindcss, SiTypescript, SiTensorflow, SiPostgresql, SiFirebase } from 'react-icons/si';

const iconsList = [
  <FaPython />, <SiCplusplus />, <FaHtml5 />, <FaCss3Alt />, <SiTailwindcss />,
  <FaReact />, <SiTypescript />, <FaNodeJs />, <SiMongodb />, <SiPostgresql />,
  <FaDocker />, <FaAws />, <SiTensorflow />, <FaGithub />, <SiFirebase />,
  <FaFigma />, <FaAndroid />
];

const IconSwing = () => {
  const containerRef = useRef(null);
  
  // Track scroll progress within this container's viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress (0 to 1) to horizontal pixel shift
  // E.g., Move from 250px to -250px as you scroll down
  const xTransform = useTransform(scrollYProgress, [0, 1], [250, -250]);

  return (
    <div className="icon-swing-container" ref={containerRef}>
      <motion.div className="icon-swing-track" style={{ x: xTransform }}>
        {iconsList.map((icon, idx) => {
          // By applying a negative animation delay, we offset each bubble's
          // float animation, creating a continuous traveling wave effect!
          // 0.3s stagger across a 5s animation = 16.6 icons per full wavelength
          return (
            <div 
              key={idx} 
              className="swing-icon-bubble"
              style={{ animationDelay: `${-(idx * 0.3)}s` }}
            >
              {icon}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default IconSwing;
